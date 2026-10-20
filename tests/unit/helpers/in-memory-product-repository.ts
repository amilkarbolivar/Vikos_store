/**
 * Doble de prueba: repositorio de productos en memoria.
 *
 * Cumple el mismo contrato (`ProductRepository`) que `ProductRepositoryImpl` y reproduce lo que
 * hace PostgreSQL: slug UNIQUE, clave foránea de la categoría y la regla de visibilidad pública
 * (disponible Y categoría activa). Depende del CONTRATO `CategoryRepository`, no de Prisma.
 */

import { randomUUID } from "node:crypto";

import type { CategoryRepository } from "../../../src/modules/categories/domain/category-repository.ts";
import {
  CategoryNotFoundError,
  DuplicateSlugError,
  ProductNotFoundError,
} from "../../../src/modules/products/domain/errors.ts";
import type { NewProduct, Product } from "../../../src/modules/products/domain/product.ts";
import type {
  ProductChanges,
  ProductListFilter,
  ProductRepository,
} from "../../../src/modules/products/domain/product-repository.ts";

export class InMemoryProductRepository implements ProductRepository {
  readonly items = new Map<string, Product>();
  private readonly categories: CategoryRepository;

  constructor(categories: CategoryRepository) {
    this.categories = categories;
  }

  async findById(id: string): Promise<Product | null> {
    return this.items.get(id) ?? null;
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return [...this.items.values()].find((p) => p.slug === slug) ?? null;
  }

  async list(filter: ProductListFilter = {}): Promise<Product[]> {
    let result = [...this.items.values()];
    if (filter.categoryId) result = result.filter((p) => p.categoryId === filter.categoryId);
    if (filter.onlyAvailable) {
      const visible = await Promise.all(
        result.map(async (p) => {
          if (!p.isAvailable) return false;
          if (p.categoryId === null) return true;
          return (await this.categories.findById(p.categoryId))?.isActive === true;
        }),
      );
      result = result.filter((_, index) => visible[index]);
    }
    return result;
  }

  async create(data: NewProduct): Promise<Product> {
    if (!(await this.categories.findById(data.categoryId))) throw new CategoryNotFoundError();
    if (await this.findBySlug(data.slug)) throw new DuplicateSlugError();
    const now = new Date();
    const product: Product = { id: randomUUID(), ...data, createdAt: now, updatedAt: now };
    this.items.set(product.id, product);
    return product;
  }

  async update(id: string, changes: ProductChanges): Promise<Product> {
    const current = this.items.get(id);
    if (!current) throw new ProductNotFoundError();
    if (changes.slug) {
      const owner = await this.findBySlug(changes.slug);
      if (owner && owner.id !== id) throw new DuplicateSlugError();
    }
    const updated: Product = {
      ...current,
      ...Object.fromEntries(Object.entries(changes).filter(([, value]) => value !== undefined)),
      updatedAt: new Date(),
    };
    this.items.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    if (!this.items.delete(id)) throw new ProductNotFoundError();
  }
}
