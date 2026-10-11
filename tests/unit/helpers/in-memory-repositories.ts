/**
 * Repositorios en memoria para las pruebas unitarias.
 *
 * Implementan los MISMOS contratos (`CategoryRepository`, `ProductRepository`)
 * que usará Prisma en producción. Es la ventaja de la inversión de
 * dependencias: los casos de uso se prueban sin base de datos, rápido y de forma
 * determinista.
 *
 * Simulan también el comportamiento de PostgreSQL que los casos de uso esperan:
 *  - UNIQUE en `slug`  -> `ConflictError`
 *  - actualizar algo inexistente -> `NotFoundError`
 *  - clave foránea producto -> categoría -> `NotFoundError` si no existe
 *
 * Solo para pruebas: no se importa desde `src/`.
 */

import { randomUUID } from "node:crypto";

import type {
  Category,
  CategoryChanges,
  NewCategory,
} from "../../../src/modules/categories/domain/category.ts";
import type {
  CategoryRepository,
  ListCategoriesOptions,
} from "../../../src/modules/categories/domain/category-repository.ts";
import type {
  NewProduct,
  Product,
  ProductChanges,
} from "../../../src/modules/products/domain/product.ts";
import type {
  ListProductsOptions,
  ProductRepository,
} from "../../../src/modules/products/domain/product-repository.ts";
import { ConflictError, NotFoundError } from "../../../src/modules/shared/domain/errors.ts";

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

export class InMemoryProductRepository implements ProductRepository {
  readonly items = new Map<string, Product>();
  /** Necesario para simular la clave foránea y el filtro `publicOnly`. */
  private readonly categories: InMemoryCategoryRepository;

  constructor(categories: InMemoryCategoryRepository) {
    this.categories = categories;
  }

  async findById(id: string): Promise<Product | null> {
    return this.items.get(id) ?? null;
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return [...this.items.values()].find((p) => p.slug === slug) ?? null;
  }

  async findAll(options: ListProductsOptions = {}): Promise<Product[]> {
    let result = [...this.items.values()];
    if (options.categoryId) result = result.filter((p) => p.categoryId === options.categoryId);
    if (options.search) {
      const term = options.search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(term));
    }
    if (options.publicOnly) {
      result = result.filter(
        (p) => p.isAvailable && this.categories.items.get(p.categoryId)?.isActive === true,
      );
    }
    return result;
  }

  async create(data: NewProduct): Promise<Product> {
    if (!this.categories.items.has(data.categoryId)) {
      throw new NotFoundError("Categoría", data.categoryId); // clave foránea
    }
    if (await this.findBySlug(data.slug)) throw new ConflictError("slug duplicado");
    const now = new Date();
    const product: Product = { id: randomUUID(), ...data, createdAt: now, updatedAt: now };
    this.items.set(product.id, product);
    return product;
  }

  async update(id: string, changes: ProductChanges): Promise<Product> {
    const current = this.items.get(id);
    if (!current) throw new NotFoundError("Producto", id);
    if (changes.slug) {
      const owner = await this.findBySlug(changes.slug);
      if (owner && owner.id !== id) throw new ConflictError("slug duplicado");
    }
    const updated: Product = { ...current, ...changes, updatedAt: new Date() };
    this.items.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    if (!this.items.delete(id)) throw new NotFoundError("Producto", id);
  }
}
