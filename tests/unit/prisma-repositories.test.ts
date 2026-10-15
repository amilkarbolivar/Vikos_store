/**
 * Pruebas de los repositorios con Prisma usando delegados falsos.
 *
 * No hablan con PostgreSQL: comprueban lo que SÍ es responsabilidad de estas
 * clases, que es (1) las consultas que arman y (2) cómo traducen los errores de
 * Prisma a errores del dominio. La prueba contra una base real es la de
 * integración (tests/integration), que necesita PostgreSQL corriendo.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getPrismaErrorCode } from "../../src/infrastructure/database/prisma-errors.ts";
import {
  PrismaAuthRepository,
  type AdminUserRow,
} from "../../src/modules/auth/infrastructure/auth-repository-impl.ts";
import {
  PrismaCategoryRepository,
  type CategoryDelegate,
  type CategoryRow,
} from "../../src/modules/categories/infrastructure/category-repository-impl.ts";
import {
  PrismaProductRepository,
  type ProductDelegate,
  type ProductRow,
  type ProductWhere,
} from "../../src/modules/products/infrastructure/product-repository-impl.ts";
import { ConflictError, NotFoundError } from "../../src/modules/shared/domain/errors.ts";

const NOW = new Date("2026-01-01T00:00:00Z");

/** Imita un error de Prisma: lo único que importa es su `code`. */
function prismaError(code: string): Error {
  return Object.assign(new Error(`prisma ${code}`), { code });
}

const categoryRow: CategoryRow = {
  id: "c1", name: "Flores", slug: "flores", description: null, isActive: true, createdAt: NOW, updatedAt: NOW,
};
const productRow: ProductRow = {
  id: "p1", name: "Rosas", slug: "rosas", description: "", priceInCents: 5_000_000, categoryId: "c1",
  imageUrl: null, isAvailable: true, createdAt: NOW, updatedAt: NOW,
};

describe("getPrismaErrorCode", () => {
  it("reconoce códigos Pxxxx y descarta cualquier otro error", () => {
    assert.equal(getPrismaErrorCode(prismaError("P2002")), "P2002");
    for (const other of [new Error("x"), null, undefined, "P2002", { code: 42 }, { code: "ECONNRESET" }]) {
      assert.equal(getPrismaErrorCode(other), undefined);
    }
  });
});

describe("PrismaCategoryRepository", () => {
  function setup(overrides: Partial<CategoryDelegate> = {}) {
    const calls: unknown[] = [];
    const delegate: CategoryDelegate = {
      findUnique: async (args) => (calls.push(args), categoryRow),
      findMany: async (args) => (calls.push(args), [categoryRow]),
      create: async (args) => (calls.push(args), categoryRow),
      update: async (args) => (calls.push(args), categoryRow),
      ...overrides,
    };
    return { repo: new PrismaCategoryRepository(delegate), calls };
  }

  it("consulta por id y por slug, y devuelve null si no hay fila", async () => {
    const { repo, calls } = setup();
    assert.equal((await repo.findById("c1"))?.slug, "flores");
    await repo.findBySlug("flores");
    assert.deepEqual(calls, [{ where: { id: "c1" } }, { where: { slug: "flores" } }]);

    const empty = setup({ findUnique: async () => null }).repo;
    assert.equal(await empty.findById("x"), null);
  });

  it("filtra por activas solo cuando se pide y ordena por nombre", async () => {
    const { repo, calls } = setup();
    await repo.findAll();
    await repo.findAll({ onlyActive: true });
    assert.deepEqual(calls, [
      { orderBy: { name: "asc" } },
      { where: { isActive: true }, orderBy: { name: "asc" } },
    ]);
  });

  it("traduce P2002 a ConflictError al crear y P2025/P2002 al actualizar", async () => {
    const dup = setup({ create: async () => { throw prismaError("P2002"); } }).repo;
    await assert.rejects(dup.create({ name: "a", slug: "a", description: null, isActive: true }), ConflictError);

    const missing = setup({ update: async () => { throw prismaError("P2025"); } }).repo;
    await assert.rejects(missing.update("c1", { name: "x" }), NotFoundError);

    const clash = setup({ update: async () => { throw prismaError("P2002"); } }).repo;
    await assert.rejects(clash.update("c1", { slug: "x" }), ConflictError);
  });

  it("relanza los errores que no son de negocio (p. ej. la base caída)", async () => {
    const down = setup({ create: async () => { throw prismaError("P1001"); } }).repo;
    await assert.rejects(
      down.create({ name: "a", slug: "a", description: null, isActive: true }),
      (error: unknown) => !(error instanceof ConflictError) && (error as Error).message === "prisma P1001",
    );
  });
});

describe("PrismaProductRepository", () => {
  function setup(overrides: Partial<ProductDelegate> = {}) {
    const calls: { where?: ProductWhere }[] = [];
    const delegate: ProductDelegate = {
      findUnique: async () => productRow,
      findMany: async (args) => (calls.push(args), [productRow]),
      create: async () => productRow,
      update: async () => productRow,
      delete: async () => productRow,
      ...overrides,
    };
    return { repo: new PrismaProductRepository(delegate), calls };
  }

  it("la vista pública exige producto disponible y categoría activa en la misma consulta", async () => {
    const { repo, calls } = setup();
    await repo.findAll({ publicOnly: true, categoryId: "c1", search: "ros" });
    assert.deepEqual(calls[0]?.where, {
      categoryId: "c1",
      name: { contains: "ros", mode: "insensitive" },
      isAvailable: true,
      category: { isActive: true },
    });
  });

  it("sin opciones no filtra nada (panel administrativo)", async () => {
    const { repo, calls } = setup();
    await repo.findAll();
    assert.deepEqual(calls[0]?.where, {});
  });

  it("al crear: P2002 es slug repetido y P2003 es categoría inexistente", async () => {
    const data = { name: "a", slug: "a", description: "", priceInCents: 100, categoryId: "c9", imageUrl: null, isAvailable: true };
    await assert.rejects(setup({ create: async () => { throw prismaError("P2002"); } }).repo.create(data), ConflictError);
    await assert.rejects(setup({ create: async () => { throw prismaError("P2003"); } }).repo.create(data), NotFoundError);
  });

  it("al actualizar: P2025 producto inexistente, P2002 slug repetido, P2003 categoría inexistente", async () => {
    await assert.rejects(setup({ update: async () => { throw prismaError("P2025"); } }).repo.update("p1", {}), NotFoundError);
    await assert.rejects(setup({ update: async () => { throw prismaError("P2002"); } }).repo.update("p1", {}), ConflictError);
    await assert.rejects(
      setup({ update: async () => { throw prismaError("P2003"); } }).repo.update("p1", { categoryId: "c9" }),
      NotFoundError,
    );
  });

  it("al eliminar: P2025 no existe y P2003 significa que tiene pedidos asociados", async () => {
    await assert.rejects(setup({ delete: async () => { throw prismaError("P2025"); } }).repo.delete("p1"), NotFoundError);
    await assert.rejects(setup({ delete: async () => { throw prismaError("P2003"); } }).repo.delete("p1"), ConflictError);
    await setup().repo.delete("p1");
  });
});

describe("PrismaAuthRepository", () => {
  it("busca por correo y por id, y no inventa usuarios", async () => {
    const row: AdminUserRow = { id: "u1", email: "a@b.co", passwordHash: "h", isActive: true, createdAt: NOW, updatedAt: NOW };
    const calls: unknown[] = [];
    const repo = new PrismaAuthRepository({
      findUnique: async (args) => (calls.push(args), "email" in args.where && args.where.email !== "a@b.co" ? null : row),
    });
    assert.equal((await repo.findAdminByEmail("a@b.co"))?.id, "u1");
    assert.equal(await repo.findAdminByEmail("otro@b.co"), null);
    await repo.findAdminById("u1");
    assert.deepEqual(calls[2], { where: { id: "u1" } });
  });
});
