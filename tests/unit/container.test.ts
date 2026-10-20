/**
 * Prueba de humo de `buildContainer`: los casos de uso quedan bien conectados entre sí. Usa
 * repositorios en memoria (dobles de prueba) porque no necesita base de datos.
 */

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { describe, it } from "node:test";

import { buildContainer } from "../../src/infrastructure/composition/container.ts";
import { CategoryInactiveError, ProductNotFoundError } from "../../src/modules/products/domain/errors.ts";
import { InMemoryCategoryRepository, InMemoryProductRepository } from "./helpers/in-memory-repositories.ts";

describe("container", () => {
  it("conecta productos y categorías: crear, listar en la tienda pública y respetar categoría inactiva", async () => {
    const categories = new InMemoryCategoryRepository();
    const container = buildContainer({ categories, products: new InMemoryProductRepository(categories) });

    const category = await container.categories.create.execute({ name: "Peluches" });
    const product = await container.products.create.execute({
      name: "Oso grande",
      priceInCents: 8_990_000,
      categoryId: category.id,
    });

    assert.deepEqual((await container.products.list.execute({ onlyAvailable: true })).map((p) => p.id), [product.id]);
    assert.equal((await container.products.getPublic.execute(product.slug)).id, product.id);

    await container.categories.deactivate.execute(category.id);
    assert.equal((await container.products.list.execute({ onlyAvailable: true })).length, 0);
    await assert.rejects(container.products.getPublic.execute(product.slug), ProductNotFoundError);
    await assert.rejects(
      container.products.create.execute({ name: "Otro", priceInCents: 1000, categoryId: category.id }),
      CategoryInactiveError,
    );

    // Reactivar la categoría devuelve los productos a la tienda sin perder datos.
    await container.categories.reactivate.execute(category.id);
    assert.equal((await container.products.list.execute({ onlyAvailable: true })).length, 1);
    await assert.rejects(container.products.getById.execute(randomUUID()), ProductNotFoundError);
  });
});
