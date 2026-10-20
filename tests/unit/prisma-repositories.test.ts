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
  CategoryNotFoundError,
  DuplicateSlugError,
  ProductNotFoundError,
} from "../../src/modules/products/domain/errors.ts";
import { ProductRepositoryImpl } from "../../src/modules/products/infrastructure/product-repository-impl.ts";
import type { PrismaClient } from "@prisma/client";

import { ConflictError, NotFoundError } from "../../src/modules/shared/domain/errors.ts";

const NOW = new Date("2026-01-01T00:00:00Z");

/** Imita un error de Prisma: lo único que importa es su `code`. */
function prismaError(code: string): Error {
  return Object.assign(new Error(`prisma ${code}`), { code });
}

const categoryRow: CategoryRow = {
  id: "c1", name: "Flores", slug: "flores", description: null, isActive: true, createdAt: NOW, updatedAt: NOW,
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

describe("ProductRepositoryImpl", () => {
  /** Cliente Prisma falso: solo lo que el repositorio usa de `prisma.product`. */
  function setup(overrides: Record<string, (args: unknown) => Promise<unknown>> = {}) {
    const calls: Record<string, unknown[]> = {};
    const record = (name: string, result: unknown) => async (args: unknown) => {
      (calls[name] ??= []).push(args);
      return result;
    };
    const row = {
      id: "p1", name: "Rosas", slug: "rosas", description: null, price: { toString: () => "50000.00" },
      categoryId: "c1", isActive: true, createdAt: NOW, updatedAt: NOW, product_images: [],
    };
    const prisma = {
      product: {
        findUnique: record("findUnique", row),
        findMany: record("findMany", [row]),
        create: record("create", row),
        update: record("update", row),
        delete: record("delete", row),
        ...overrides,
      },
    } as unknown as PrismaClient;
    return { repo: new ProductRepositoryImpl(prisma), calls };
  }

  function whereOf(calls: Record<string, unknown[]>): unknown {
    return (calls["findMany"]?.[0] as { where: unknown }).where;
  }

  it("la vista pública exige producto disponible y categoría sin categoría o activa en la misma consulta", async () => {
    const { repo, calls } = setup();
    await repo.list({ onlyAvailable: true, categoryId: "c1" });
    assert.deepEqual(whereOf(calls), {
      categoryId: "c1",
      isActive: true,
      OR: [{ categoryId: null }, { categories: { is_active: true } }],
    });
  });

  it("sin filtros no restringe nada (panel administrativo)", async () => {
    const { repo, calls } = setup();
    await repo.list();
    assert.deepEqual(whereOf(calls), {});
  });

  it("convierte la fila: precio decimal a centavos y descripción nula a texto vacío", async () => {
    const product = await setup().repo.findById("p1");
    assert.equal(product?.priceInCents, 5_000_000);
    assert.equal(product?.description, "");
    assert.equal(product?.isAvailable, true);
  });

  it("al crear: P2002 sobre slug es slug repetido y P2003 es categoría inexistente", async () => {
    const data = { name: "a", slug: "a", description: "", priceInCents: 100, categoryId: "c9", imageUrl: null, isAvailable: true };
    const dup = Object.assign(prismaError("P2002"), { meta: { target: ["slug"] } });
    await assert.rejects(setup({ create: async () => { throw dup; } }).repo.create(data), DuplicateSlugError);
    await assert.rejects(setup({ create: async () => { throw prismaError("P2003"); } }).repo.create(data), CategoryNotFoundError);
  });

  it("al actualizar: P2025 producto inexistente", async () => {
    await assert.rejects(
      setup({ update: async () => { throw prismaError("P2025"); } }).repo.update("p1", {}),
      ProductNotFoundError,
    );
  });

  it("al eliminar: P2025 no existe y P2003 significa que tiene registros asociados", async () => {
    await assert.rejects(setup({ delete: async () => { throw prismaError("P2025"); } }).repo.delete("p1"), ProductNotFoundError);
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
