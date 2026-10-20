/**
 * Pruebas de los adaptadores HTTP de productos y categorías: permisos, visibilidad pública,
 * validación de la estructura, códigos de estado y que ningún error interno se filtre.
 * Los handlers se cablean con casos de uso REALES sobre repositorios en memoria.
 */

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { beforeEach, describe, it } from "node:test";

import { buildContainer, type Container } from "../../src/infrastructure/composition/container.ts";
import { createCategoryHandler } from "../../src/modules/categories/presentation/create-category-handler.ts";
import { getCategoryHandler } from "../../src/modules/categories/presentation/get-category-handler.ts";
import { listCategoriesHandler } from "../../src/modules/categories/presentation/list-categories-handler.ts";
import { setCategoryStatusHandler } from "../../src/modules/categories/presentation/set-category-status-handler.ts";
import { updateCategoryHandler } from "../../src/modules/categories/presentation/update-category-handler.ts";
import { deactivateProductHandler } from "../../src/modules/products/presentation/deactivate-product-handler.ts";
import { deleteProductHandler } from "../../src/modules/products/presentation/delete-product-handler.ts";
import { getProductHandler } from "../../src/modules/products/presentation/get-product-handler.ts";
import { listProductsHandler } from "../../src/modules/products/presentation/list-products-handler.ts";
import { updateProductHandler } from "../../src/modules/products/presentation/update-product-handler.ts";
import { UnauthorizedError } from "../../src/modules/shared/domain/errors.ts";
import { InMemoryCategoryRepository, InMemoryProductRepository } from "./helpers/in-memory-repositories.ts";

const logged: Record<string, unknown>[] = [];
const logger = { error: (_message: string, meta?: Record<string, unknown>) => void logged.push(meta ?? {}) };

let container: Container;
let isAdmin: boolean;
const requireAdmin = async () => {
  if (!isAdmin) throw new UnauthorizedError();
  return {};
};

beforeEach(() => {
  logged.length = 0;
  isAdmin = true;
  const categories = new InMemoryCategoryRepository();
  container = buildContainer({ categories, products: new InMemoryProductRepository(categories) });
});

function request(method: string, path: string, body?: unknown): Request {
  return new Request(`http://localhost${path}`, {
    method,
    ...(body !== undefined ? { body: typeof body === "string" ? body : JSON.stringify(body) } : {}),
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const json = async (response: Response) => (await response.json()) as Record<string, any>;

async function seed() {
  const category = await container.categories.create.execute({ name: "Peluches" });
  const product = await container.products.create.execute({
    name: "Oso grande",
    priceInCents: 8_990_000,
    categoryId: category.id,
  });
  return { category, product };
}

const productHandlers = () => ({
  get: getProductHandler({
    requireAdmin,
    getPublicProduct: container.products.getPublic,
    getProductById: container.products.getById,
    getProductBySlug: container.products.getBySlug,
    logger,
  }),
  update: updateProductHandler({ requireAdmin, updateProduct: container.products.update, logger }),
  remove: deleteProductHandler({ requireAdmin, deleteProduct: container.products.delete, logger }),
  deactivate: deactivateProductHandler({ requireAdmin, deactivateProduct: container.products.deactivate, logger }),
  list: listProductsHandler({ requireAdmin, listProducts: container.products.list, logger }),
});

describe("GET /api/productos/:idOrSlug", () => {
  it("es público: por slug y por id", async () => {
    const { product } = await seed();
    isAdmin = false;
    const { get } = productHandlers();
    for (const key of [product.slug, product.id]) {
      const response = await get(request("GET", `/api/productos/${key}`), key);
      assert.equal(response.status, 200);
      const body = await json(response);
      assert.equal(body["price"], 89_900);
      assert.equal(body["priceInCents"], 8_990_000);
    }
  });

  it("un producto oculto o de categoría inactiva es 404 para el público, pero lo ve un administrador", async () => {
    const { product, category } = await seed();
    await container.products.deactivate.execute(product.id);
    const { get } = productHandlers();

    isAdmin = false;
    assert.equal((await get(request("GET", "/x"), product.slug)).status, 404);
    isAdmin = true;
    const asAdmin = await get(request("GET", "/x"), product.slug);
    assert.equal(asAdmin.status, 200);
    assert.equal((await json(asAdmin))["isAvailable"], false);

    await container.products.update.execute(product.id, { isAvailable: true });
    await container.categories.deactivate.execute(category.id);
    isAdmin = false;
    assert.equal((await get(request("GET", "/x"), product.id)).status, 404);
  });

  it("slug inexistente: 404 con cuerpo de error estándar", async () => {
    const response = await productHandlers().get(request("GET", "/x"), "no-existe");
    assert.equal(response.status, 404);
    assert.equal((await json(response))["error"]["code"], "PRODUCT_NOT_FOUND");
  });
});

describe("PATCH /api/productos/:id", () => {
  it("exige administrador (401) y un UUID válido (400)", async () => {
    const { product } = await seed();
    const { update } = productHandlers();

    isAdmin = false;
    assert.equal((await update(request("PATCH", "/x", { name: "N" }), product.id)).status, 401);
    isAdmin = true;
    assert.equal((await update(request("PATCH", "/x", { name: "N" }), "no-uuid")).status, 400);
  });

  it("actualiza parcialmente y convierte el precio de pesos a centavos", async () => {
    const { product } = await seed();
    const response = await productHandlers().update(request("PATCH", "/x", { price: "59900.50", name: "Oso XL" }), product.id);
    assert.equal(response.status, 200);
    const body = await json(response);
    assert.equal(body["priceInCents"], 5_990_050);
    assert.equal(body["name"], "Oso XL");
    assert.equal(body["slug"], product.slug);
  });

  it("valida la estructura: cuerpo vacío, campos no permitidos, tipos y precio", async () => {
    const { product } = await seed();
    const { update } = productHandlers();
    const attempts: unknown[] = [{}, [], { id: randomUUID() }, { createdAt: "x" }, { name: 5 }, { price: "abc" }, { isAvailable: "si" }, { price: null }];
    for (const body of attempts) {
      const response = await update(request("PATCH", "/x", body), product.id);
      assert.equal(response.status, 400, JSON.stringify(body));
      assert.equal((await json(response))["error"]["code"], "VALIDATION_ERROR");
    }
    assert.equal((await update(request("PATCH", "/x", "{no es json"), product.id)).status, 400);
  });

  it("slug repetido: 409 señalando el campo; categoría inactiva: 422", async () => {
    const { product, category } = await seed();
    const other = await container.products.create.execute({ name: "Otro", priceInCents: 1000, categoryId: category.id });
    const { update } = productHandlers();

    const dup = await update(request("PATCH", "/x", { slug: product.slug }), other.id);
    assert.equal(dup.status, 409);
    assert.equal((await json(dup))["error"]["details"][0]["field"], "slug");

    const inactive = await container.categories.create.execute({ name: "Retirada" });
    await container.categories.deactivate.execute(inactive.id);
    const moved = await update(request("PATCH", "/x", { categoryId: inactive.id }), other.id);
    assert.equal(moved.status, 422);
  });

  it("producto inexistente: 404", async () => {
    const response = await productHandlers().update(request("PATCH", "/x", { name: "N" }), randomUUID());
    assert.equal(response.status, 404);
  });
});

describe("DELETE y desactivar producto", () => {
  it("DELETE: 401 sin sesión, 204 al borrar y 404 la segunda vez", async () => {
    const { product } = await seed();
    const { remove } = productHandlers();

    isAdmin = false;
    assert.equal((await remove(request("DELETE", "/x"), product.id)).status, 401);
    isAdmin = true;
    const done = await remove(request("DELETE", "/x"), product.id);
    assert.equal(done.status, 204);
    assert.equal(await done.text(), "");
    assert.equal((await remove(request("DELETE", "/x"), product.id)).status, 404);
  });

  it("desactivar oculta el producto de la tienda y es idempotente", async () => {
    const { product } = await seed();
    const { deactivate, list } = productHandlers();

    for (let i = 0; i < 2; i++) {
      const response = await deactivate(request("POST", "/x"), product.id);
      assert.equal(response.status, 200);
      assert.equal((await json(response))["isAvailable"], false);
    }
    isAdmin = false;
    assert.deepEqual((await json(await list(request("GET", "/api/productos"))))["data"], []);
  });
});

describe("GET /api/productos?includeInactive", () => {
  it("el público no puede pedir ocultos (401); un administrador sí; valores raros dan 400", async () => {
    const { product } = await seed();
    await container.products.deactivate.execute(product.id);
    const { list } = productHandlers();

    isAdmin = false;
    assert.equal((await list(request("GET", "/api/productos?includeInactive=true"))).status, 401);
    assert.equal((await json(await list(request("GET", "/api/productos"))))["data"].length, 0);

    isAdmin = true;
    const all = await list(request("GET", "/api/productos?includeInactive=true"));
    assert.equal((await json(all))["data"].length, 1);
    assert.equal(all.headers.get("cache-control"), "private, no-store");
    assert.equal((await list(request("GET", "/api/productos?includeInactive=quizas"))).status, 400);
  });

  it("sin requireAdmin configurado, includeInactive falla cerrado (401)", async () => {
    const list = listProductsHandler({ listProducts: container.products.list, logger });
    assert.equal((await list(request("GET", "/api/productos?includeInactive=true"))).status, 401);
  });
});

const categoryHandlers = () => ({
  create: createCategoryHandler({ requireAdmin, createCategory: container.categories.create, logger }),
  list: listCategoriesHandler({ requireAdmin, listCategories: container.categories.list, logger }),
  get: getCategoryHandler({
    requireAdmin,
    getCategoryById: container.categories.getById,
    getCategoryBySlug: container.categories.getBySlug,
    logger,
  }),
  update: updateCategoryHandler({ requireAdmin, updateCategory: container.categories.update, logger }),
  deactivate: setCategoryStatusHandler({ requireAdmin, setStatus: container.categories.deactivate, logger }),
  reactivate: setCategoryStatusHandler({ requireAdmin, setStatus: container.categories.reactivate, logger }),
});

describe("categorías", () => {
  it("POST crea (201 + Location), exige administrador y rechaza duplicados e isActive", async () => {
    const { create } = categoryHandlers();

    isAdmin = false;
    assert.equal((await create(request("POST", "/x", { name: "Flores" }))).status, 401);
    isAdmin = true;

    const created = await create(request("POST", "/x", { name: "Flores", description: "Ramos" }));
    assert.equal(created.status, 201);
    assert.equal(created.headers.get("location"), "/api/categorias/flores");
    assert.equal((await json(created))["isActive"], true);

    assert.equal((await create(request("POST", "/x", { name: "Flores" }))).status, 409);
    assert.equal((await create(request("POST", "/x", { name: "  " }))).status, 400);
    assert.equal((await create(request("POST", "/x", {}))).status, 400);
    assert.equal((await create(request("POST", "/x", { name: "X", isActive: false }))).status, 400);
  });

  it("GET lista solo activas al público; includeInactive es solo para administradores", async () => {
    const { category } = await seed();
    const flores = await container.categories.create.execute({ name: "Flores" });
    await container.categories.deactivate.execute(flores.id);
    const { list } = categoryHandlers();

    isAdmin = false;
    const publicList = (await json(await list(request("GET", "/api/categorias"))))["data"];
    assert.deepEqual(publicList.map((c: { id: string }) => c.id), [category.id]);
    assert.equal((await list(request("GET", "/api/categorias?includeInactive=true"))).status, 401);

    isAdmin = true;
    const all = (await json(await list(request("GET", "/api/categorias?includeInactive=true"))))["data"];
    assert.equal(all.length, 2);
  });

  it("GET por slug o id: la inactiva es 404 para el público y visible para el administrador", async () => {
    const { category } = await seed();
    await container.categories.deactivate.execute(category.id);
    const { get } = categoryHandlers();

    isAdmin = false;
    assert.equal((await get(request("GET", "/x"), category.slug)).status, 404);
    assert.equal((await get(request("GET", "/x"), category.id)).status, 404);
    isAdmin = true;
    assert.equal((await get(request("GET", "/x"), category.slug)).status, 200);
    assert.equal((await get(request("GET", "/x"), "no-existe")).status, 404);
  });

  it("PATCH actualiza parcialmente, conserva el slug y valida", async () => {
    const { category } = await seed();
    const { update } = categoryHandlers();

    const ok = await update(request("PATCH", "/x", { name: "Peluches XL", description: null }), category.id);
    assert.equal(ok.status, 200);
    const body = await json(ok);
    assert.equal(body["name"], "Peluches XL");
    assert.equal(body["slug"], category.slug);

    assert.equal((await update(request("PATCH", "/x", {}), category.id)).status, 400);
    assert.equal((await update(request("PATCH", "/x", { name: "A" }), "no-uuid")).status, 400);
    assert.equal((await update(request("PATCH", "/x", { name: "A" }), randomUUID())).status, 404);

    const flores = await container.categories.create.execute({ name: "Flores" });
    assert.equal((await update(request("PATCH", "/x", { slug: category.slug }), flores.id)).status, 409);
  });

  it("desactivar y reactivar: idempotentes, exigen administrador y ocultan/muestran sus productos", async () => {
    const { category, product } = await seed();
    const { deactivate, reactivate } = categoryHandlers();
    const { list } = productHandlers();

    isAdmin = false;
    assert.equal((await deactivate(request("POST", "/x"), category.id)).status, 401);
    isAdmin = true;

    for (let i = 0; i < 2; i++) {
      const response = await deactivate(request("POST", "/x"), category.id);
      assert.equal(response.status, 200);
      assert.equal((await json(response))["isActive"], false);
    }
    isAdmin = false;
    assert.equal((await json(await list(request("GET", "/api/productos"))))["data"].length, 0);

    isAdmin = true;
    assert.equal((await json(await reactivate(request("POST", "/x"), category.id)))["isActive"], true);
    isAdmin = false;
    assert.equal((await json(await list(request("GET", "/api/productos"))))["data"][0]["id"], product.id);
  });
});

describe("errores internos", () => {
  it("un fallo inesperado devuelve 500 genérico y no filtra el mensaje original", async () => {
    const boom = new Error("password=super-secreto host=db.interno", { cause: Object.assign(new Error("x"), { code: "ECONNREFUSED" }) });
    const handler = getProductHandler({
      requireAdmin,
      getPublicProduct: { execute: async () => { throw boom; } },
      getProductById: { execute: async () => { throw boom; } },
      getProductBySlug: { execute: async () => { throw boom; } },
      logger,
    });
    isAdmin = false;
    const response = await handler(request("GET", "/x"), "algo");
    assert.equal(response.status, 500);
    const text = await response.text();
    assert.doesNotMatch(text, /super-secreto|db\.interno/);
    assert.equal(JSON.parse(text).error.code, "INTERNAL_ERROR");
    assert.ok(!JSON.stringify(logged).includes("super-secreto"));
    assert.equal(logged[0]?.["causeCode"], "ECONNREFUSED");
  });

  it("un error de infraestructura al verificar el administrador no se confunde con 'no es admin'", async () => {
    const handler = getProductHandler({
      requireAdmin: async () => { throw new Error("base de datos caída"); },
      getPublicProduct: container.products.getPublic,
      getProductById: container.products.getById,
      getProductBySlug: container.products.getBySlug,
      logger,
    });
    assert.equal((await handler(request("GET", "/x"), "algo")).status, 500);
  });
});
