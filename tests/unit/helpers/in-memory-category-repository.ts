/**
 * Doble de prueba: repositorio de categorías en memoria.
 *
 * Implementa el mismo contrato (`CategoryRepository`) que la versión real con
 * Prisma, para probar los casos de uso sin base de datos. Vive en `tests/` porque
 * NO es infraestructura de la aplicación: la aplicación usa solo Prisma.
 *
 * Imita lo que hará PostgreSQL: slug UNIQUE (`ConflictError`) y actualizar algo
 * inexistente (`NotFoundError`).
 */

import { randomUUID } from "node:crypto";

import { ConflictError, NotFoundError } from "../../../src/modules/shared/domain/errors.ts";
import type { Category, CategoryChanges, NewCategory } from "../../../src/modules/categories/domain/category.ts";
import type {
  CategoryRepository,
  ListCategoriesOptions,
} from "../../../src/modules/categories/domain/category-repository.ts";

export class InMemoryCategoryRepository implements CategoryRepository {
  readonly items = new Map<string, Category>();

  async findById(id: string): Promise<Category | null> {
    return this.items.get(id) ?? null;
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return [...this.items.values()].find((c) => c.slug === slug) ?? null;
  }

  async findAll(options: ListCategoriesOptions = {}): Promise<Category[]> {
    const all = [...this.items.values()];
    return options.onlyActive ? all.filter((c) => c.isActive) : all;
  }

  async create(data: NewCategory): Promise<Category> {
    if (await this.findBySlug(data.slug)) throw new ConflictError("slug duplicado");
    const now = new Date();
    const category: Category = { id: randomUUID(), ...data, createdAt: now, updatedAt: now };
    this.items.set(category.id, category);
    return category;
  }

  async update(id: string, changes: CategoryChanges): Promise<Category> {
    const current = this.items.get(id);
    if (!current) throw new NotFoundError("Categoría", id);
    if (changes.slug) {
      const owner = await this.findBySlug(changes.slug);
      if (owner && owner.id !== id) throw new ConflictError("slug duplicado");
    }
    const updated: Category = { ...current, ...changes, updatedAt: new Date() };
    this.items.set(id, updated);
    return updated;
  }
}
