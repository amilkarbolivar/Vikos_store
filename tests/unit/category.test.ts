/**
 * Pruebas de los casos de uso de categorías, con repositorio en memoria.
 */

import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";

import { CreateCategory } from "../../src/modules/categories/application/create-category.ts";
import { GetCategoryById } from "../../src/modules/categories/application/get-category-by-id.ts";
import { GetCategoryBySlug } from "../../src/modules/categories/application/get-category-by-slug.ts";
import { ListCategories } from "../../src/modules/categories/application/list-categories.ts";
import {
  DeactivateCategory,
  ReactivateCategory,
} from "../../src/modules/categories/application/set-category-status.ts";
import { UpdateCategory } from "../../src/modules/categories/application/update-category.ts";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../src/modules/shared/domain/errors.ts";
import { InMemoryCategoryRepository } from "./helpers/in-memory-repositories.ts";

let categories: InMemoryCategoryRepository;
let create: CreateCategory;

beforeEach(() => {
  categories = new InMemoryCategoryRepository();
  create = new CreateCategory({ categories });
});

describe("CreateCategory", () => {
  it("crea una categoría activa y deriva el slug del nombre", async () => {
    const category = await create.execute({ name: "  Cumpleaños  ", description: "  " });
    assert.equal(category.name, "Cumpleaños");
    assert.equal(category.slug, "cumpleanos");
    assert.equal(category.description, null);
    assert.equal(category.isActive, true);
  });

  it("rechaza nombres vacíos o solo espacios", async () => {
    await assert.rejects(create.execute({ name: "   " }), ValidationError);
  });

  it("rechaza un slug explícito inválido", async () => {
    await assert.rejects(create.execute({ name: "Flores", slug: "Flores!" }), ValidationError);
  });

  it("no permite duplicar el slug", async () => {
    await create.execute({ name: "Peluches" });
    await assert.rejects(create.execute({ name: "Peluches" }), ConflictError);
    await assert.rejects(create.execute({ name: "Otro", slug: "peluches" }), ConflictError);
  });
});

describe("consultas", () => {
  it("obtiene por id y por slug, y lanza NotFoundError si no existe", async () => {
    const created = await create.execute({ name: "Flores" });
    assert.equal((await new GetCategoryById({ categories }).execute(created.id)).id, created.id);
    assert.equal((await new GetCategoryBySlug({ categories }).execute("flores")).id, created.id);
    await assert.rejects(new GetCategoryById({ categories }).execute("nope"), NotFoundError);
    await assert.rejects(new GetCategoryBySlug({ categories }).execute("nope"), NotFoundError);
  });

  it("lista solo las activas cuando se pide", async () => {
    const a = await create.execute({ name: "A" });
    await create.execute({ name: "B" });
    await new DeactivateCategory({ categories }).execute(a.id);

    const list = new ListCategories({ categories });
    assert.equal((await list.execute()).length, 2);
    assert.deepEqual((await list.execute({ onlyActive: true })).map((c) => c.name), ["B"]);
  });
});

describe("UpdateCategory", () => {
  it("cambia el nombre pero conserva el slug (URLs estables)", async () => {
    const created = await create.execute({ name: "Flores" });
    const updated = await new UpdateCategory({ categories }).execute(created.id, {
      name: "Flores y plantas",
    });
    assert.equal(updated.name, "Flores y plantas");
    assert.equal(updated.slug, "flores");
  });

  it("rechaza un slug que pertenece a otra categoría", async () => {
    await create.execute({ name: "Flores" });
    const other = await create.execute({ name: "Peluches" });
    await assert.rejects(
      new UpdateCategory({ categories }).execute(other.id, { slug: "flores" }),
      ConflictError,
    );
  });

  it("permite reenviar su propio slug sin error", async () => {
    const created = await create.execute({ name: "Flores" });
    const updated = await new UpdateCategory({ categories }).execute(created.id, { slug: "flores" });
    assert.equal(updated.slug, "flores");
  });

  it("lanza NotFoundError si la categoría no existe y ValidationError si el nombre es vacío", async () => {
    const useCase = new UpdateCategory({ categories });
    await assert.rejects(useCase.execute("nope", { name: "X" }), NotFoundError);
    const created = await create.execute({ name: "Flores" });
    await assert.rejects(useCase.execute(created.id, { name: " " }), ValidationError);
  });
});

describe("desactivar y reactivar", () => {
  it("desactiva sin borrar y es idempotente; luego reactiva", async () => {
    const created = await create.execute({ name: "Flores" });
    const deactivate = new DeactivateCategory({ categories });

    assert.equal((await deactivate.execute(created.id)).isActive, false);
    assert.equal((await deactivate.execute(created.id)).isActive, false);
    assert.equal(categories.items.size, 1);

    assert.equal((await new ReactivateCategory({ categories }).execute(created.id)).isActive, true);
  });

  it("lanza NotFoundError si no existe", async () => {
    await assert.rejects(new DeactivateCategory({ categories }).execute("nope"), NotFoundError);
  });
});
