/**
 * Pruebas de los casos de uso de productos, con repositorios en memoria.
 *
 * Cubren las reglas pedidas: categoría inexistente, categoría inactiva, precios inválidos,
 * slugs únicos, visibilidad pública y actualización parcial.
 */

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { beforeEach, describe, it } from "node:test";

import { CreateCategory } from "../../src/modules/categories/application/create-category.ts";
import { DeactivateCategory } from "../../src/modules/categories/application/set-category-status.ts";
import type { Category } from "../../src/modules/categories/domain/category.ts";
import { CreateProduct, type CreateProductInput } from "../../src/modules/products/application/create-product.ts";
import { DeactivateProduct } from "../../src/modules/products/application/deactivate-product.ts";
import { DeleteProduct } from "../../src/modules/products/application/delete-product.ts";
import { GetProductById } from "../../src/modules/products/application/get-product-by-id.ts";
import { GetProductBySlug } from "../../src/modules/products/application/get-product-by-slug.ts";
import { GetPublicProduct } from "../../src/modules/products/application/get-public-product.ts";
import { ListProducts } from "../../src/modules/products/application/list-products.ts";
import { UpdateProduct } from "../../src/modules/products/application/update-product.ts";
import {
  CategoryInactiveError,
  CategoryNotFoundError,
  DuplicateSlugError,
  ProductNotFoundError,
} from "../../src/modules/products/domain/errors.ts";
import { AppError, DomainError, ValidationError } from "../../src/modules/shared/domain/errors.ts";
import { MAX_PRICE_IN_CENTS } from "../../src/modules/shared/domain/money.ts";
import { InMemoryCategoryRepository, InMemoryProductRepository } from "./helpers/in-memory-repositories.ts";

let categories: InMemoryCategoryRepository;
let products: InMemoryProductRepository;
let category: Category;
let createProduct: CreateProduct;

/** Producto válido de base; cada prueba sobrescribe solo lo que le interesa. */
function validInput(overrides: Partial<CreateProductInput> = {}): CreateProductInput {
  return {
    name: "Caja de chocolates",
    description: "Surtido de 12 chocolates artesanales.",
    priceInCents: 4_590_000, // $45.900 COP
    categoryId: category.id,
    ...overrides,
  };
}

beforeEach(async () => {
  categories = new InMemoryCategoryRepository();
  products = new InMemoryProductRepository(categories);
  category = await new CreateCategory({ categories }).execute({ name: "Dulces" });
  createProduct = new CreateProduct(products, categories);
});

describe("CreateProduct", () => {
  it("crea un producto válido, deriva el slug y lo deja disponible", async () => {
    const product = await createProduct.execute(validInput());
    assert.equal(product.slug, "caja-de-chocolates");
    assert.equal(product.priceInCents, 4_590_000);
    assert.equal(product.isAvailable, true);
    assert.equal(product.imageUrl, null);
  });

  it("rechaza una categoría inexistente", async () => {
    await assert.rejects(createProduct.execute(validInput({ categoryId: randomUUID() })), CategoryNotFoundError);
    assert.equal(products.items.size, 0);
  });

  it("rechaza una categoría inactiva", async () => {
    await new DeactivateCategory({ categories }).execute(category.id);
    await assert.rejects(createProduct.execute(validInput()), CategoryInactiveError);
    assert.equal(products.items.size, 0);
  });

  it("rechaza precios inválidos", async () => {
    for (const priceInCents of [0, -100, 10.5, Number.NaN, Number.POSITIVE_INFINITY, MAX_PRICE_IN_CENTS + 1]) {
      await assert.rejects(
        createProduct.execute(validInput({ priceInCents, name: `Producto ${String(priceInCents)}` })),
        ValidationError,
        `precio ${String(priceInCents)}`,
      );
    }
    assert.equal(products.items.size, 0);
  });

  it("acepta el precio máximo permitido", async () => {
    const product = await createProduct.execute(validInput({ priceInCents: MAX_PRICE_IN_CENTS }));
    assert.equal(product.priceInCents, MAX_PRICE_IN_CENTS);
  });

  it("rechaza nombre vacío", async () => {
    await assert.rejects(createProduct.execute(validInput({ name: "   " })), ValidationError);
  });

  it("no permite duplicar el slug", async () => {
    await createProduct.execute(validInput());
    await assert.rejects(createProduct.execute(validInput()), DuplicateSlugError);
    await assert.rejects(
      createProduct.execute(validInput({ name: "Otra caja", slug: "caja-de-chocolates" })),
      DuplicateSlugError,
    );
  });

  it("rechaza URLs de imagen con esquemas peligrosos o mal formadas", async () => {
    for (const imageUrl of ["javascript:alert(1)", "data:text/html;base64,AAAA", "no es una url"]) {
      await assert.rejects(
        createProduct.execute(validInput({ imageUrl, name: `P ${imageUrl}` })),
        ValidationError,
        imageUrl,
      );
    }
    const ok = await createProduct.execute(validInput({ imageUrl: "https://cdn.ejemplo.com/a.jpg" }));
    assert.equal(ok.imageUrl, "https://cdn.ejemplo.com/a.jpg");
  });

  it("todos los errores de negocio son AppError (el borde puede traducirlos a HTTP)", async () => {
    await assert.rejects(createProduct.execute(validInput({ priceInCents: 0 })), (error: unknown) => {
      assert.ok(error instanceof DomainError);
      assert.ok(error instanceof AppError);
      assert.equal(error.code, "VALIDATION_ERROR");
      return true;
    });
  });
});

describe("consultas y listado", () => {
  it("obtiene por id y por slug; ProductNotFoundError si no existe", async () => {
    const product = await createProduct.execute(validInput());
    assert.equal((await new GetProductById(products).execute(product.id)).id, product.id);
    assert.equal((await new GetProductBySlug(products).execute(product.slug)).id, product.id);
    await assert.rejects(new GetProductById(products).execute(randomUUID()), ProductNotFoundError);
    await assert.rejects(new GetProductBySlug(products).execute("nope"), ProductNotFoundError);
  });

  it("el listado público oculta productos no disponibles y los de categorías inactivas", async () => {
    const visible = await createProduct.execute(validInput({ name: "Visible" }));
    const hidden = await createProduct.execute(validInput({ name: "Oculto" }));
    await new DeactivateProduct(products).execute(hidden.id);

    const other = await new CreateCategory({ categories }).execute({ name: "Flores" });
    await createProduct.execute(validInput({ name: "Rosas", categoryId: other.id }));
    await new DeactivateCategory({ categories }).execute(other.id);

    const list = new ListProducts(products);
    assert.equal((await list.execute()).length, 3);
    assert.deepEqual((await list.execute({ onlyAvailable: true })).map((p) => p.id), [visible.id]);
  });

  it("filtra por categoría", async () => {
    await createProduct.execute(validInput({ name: "Chocolate negro" }));
    const other = await new CreateCategory({ categories }).execute({ name: "Flores" });
    await createProduct.execute(validInput({ name: "Rosas", categoryId: other.id }));
    const list = new ListProducts(products);
    assert.equal((await list.execute({ categoryId: category.id })).length, 1);
    assert.equal((await list.execute({ categoryId: other.id })).length, 1);
  });
});

describe("GetPublicProduct", () => {
  it("resuelve por slug y por id cuando el producto es visible", async () => {
    const product = await createProduct.execute(validInput());
    const getPublic = new GetPublicProduct(products, categories);
    assert.equal((await getPublic.execute(product.slug)).id, product.id);
    assert.equal((await getPublic.execute(product.id)).id, product.id);
  });

  it("responde 'no existe' si está oculto, su categoría está inactiva o no existe", async () => {
    const getPublic = new GetPublicProduct(products, categories);

    const hidden = await createProduct.execute(validInput({ name: "Oculto" }));
    await new DeactivateProduct(products).execute(hidden.id);
    await assert.rejects(getPublic.execute(hidden.slug), ProductNotFoundError);

    const other = await new CreateCategory({ categories }).execute({ name: "Flores" });
    const roses = await createProduct.execute(validInput({ name: "Rosas", categoryId: other.id }));
    await new DeactivateCategory({ categories }).execute(other.id);
    await assert.rejects(getPublic.execute(roses.slug), ProductNotFoundError);

    await assert.rejects(getPublic.execute("nope"), ProductNotFoundError);
  });
});

describe("UpdateProduct", () => {
  let update: UpdateProduct;
  beforeEach(() => {
    update = new UpdateProduct(products, categories);
  });

  it("actualiza precio y nombre, y conserva el slug", async () => {
    const product = await createProduct.execute(validInput());
    const updated = await update.execute(product.id, { name: "Chocolates premium", priceInCents: 5_000_000 });
    assert.equal(updated.name, "Chocolates premium");
    assert.equal(updated.priceInCents, 5_000_000);
    assert.equal(updated.slug, "caja-de-chocolates");
  });

  it("solo toca los campos enviados", async () => {
    const product = await createProduct.execute(validInput({ imageUrl: "https://cdn.ejemplo.com/a.jpg" }));
    const updated = await update.execute(product.id, { isAvailable: false });
    assert.equal(updated.isAvailable, false);
    assert.equal(updated.name, product.name);
    assert.equal(updated.imageUrl, "https://cdn.ejemplo.com/a.jpg");
  });

  it("no escribe si no hay cambios reales", async () => {
    const product = await createProduct.execute(validInput());
    const result = await update.execute(product.id, { name: product.name, priceInCents: product.priceInCents });
    assert.equal(result.updatedAt.getTime(), product.updatedAt.getTime());
  });

  it("rechaza precio inválido sin modificar el producto", async () => {
    const product = await createProduct.execute(validInput());
    await assert.rejects(update.execute(product.id, { priceInCents: -5 }), ValidationError);
    assert.equal((await products.findById(product.id))?.priceInCents, 4_590_000);
  });

  it("acumula todos los problemas de validación en un único error", async () => {
    const product = await createProduct.execute(validInput());
    await assert.rejects(
      update.execute(product.id, { name: "  ", priceInCents: 0, categoryId: "no-uuid" }),
      (error: unknown) => {
        assert.ok(error instanceof ValidationError);
        assert.deepEqual(error.issues.map((i) => i.field).sort(), ["categoryId", "name", "price"]);
        return true;
      },
    );
  });

  it("rechaza mover el producto a una categoría inexistente o inactiva", async () => {
    const product = await createProduct.execute(validInput());
    await assert.rejects(update.execute(product.id, { categoryId: randomUUID() }), CategoryNotFoundError);

    const inactive = await new CreateCategory({ categories }).execute({ name: "Retirada" });
    await new DeactivateCategory({ categories }).execute(inactive.id);
    await assert.rejects(update.execute(product.id, { categoryId: inactive.id }), CategoryInactiveError);
  });

  it("permite editar un producto cuya categoría actual fue desactivada", async () => {
    const product = await createProduct.execute(validInput());
    await new DeactivateCategory({ categories }).execute(category.id);
    const updated = await update.execute(product.id, { description: "Nueva descripción" });
    assert.equal(updated.description, "Nueva descripción");
  });

  it("rechaza un slug que pertenece a otro producto, pero acepta el suyo", async () => {
    const one = await createProduct.execute(validInput({ name: "Uno" }));
    const two = await createProduct.execute(validInput({ name: "Dos" }));
    await assert.rejects(update.execute(two.id, { slug: "uno" }), DuplicateSlugError);
    assert.equal((await update.execute(one.id, { slug: "uno" })).slug, "uno");
  });

  it("un slug vacío se regenera desde el nombre nuevo", async () => {
    const product = await createProduct.execute(validInput());
    const updated = await update.execute(product.id, { name: "Torta de fresa", slug: "" });
    assert.equal(updated.slug, "torta-de-fresa");
  });

  it("lanza ProductNotFoundError si el producto no existe", async () => {
    await assert.rejects(update.execute(randomUUID(), { name: "X" }), ProductNotFoundError);
  });

  it("puede quitar la imagen enviando null y vaciar la descripción", async () => {
    const product = await createProduct.execute(validInput({ imageUrl: "https://cdn.ejemplo.com/a.jpg" }));
    const updated = await update.execute(product.id, { imageUrl: null, description: null });
    assert.equal(updated.imageUrl, null);
    assert.equal(updated.description, "");
  });
});

describe("desactivar y eliminar", () => {
  it("desactivar conserva el registro y es idempotente", async () => {
    const product = await createProduct.execute(validInput());
    const deactivate = new DeactivateProduct(products);
    assert.equal((await deactivate.execute(product.id)).isAvailable, false);
    assert.equal((await deactivate.execute(product.id)).isAvailable, false);
    assert.equal(products.items.size, 1);
  });

  it("eliminar borra el registro; ProductNotFoundError si no existe", async () => {
    const product = await createProduct.execute(validInput());
    await new DeleteProduct(products).execute(product.id);
    assert.equal(products.items.size, 0);
    await assert.rejects(new DeleteProduct(products).execute(product.id), ProductNotFoundError);
    await assert.rejects(new DeactivateProduct(products).execute(randomUUID()), ProductNotFoundError);
  });
});
