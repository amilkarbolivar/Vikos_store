/**
 * Doble de prueba: repositorio de productos en memoria.
 *
 * Igual que el de categorías: mismo contrato que la versión real con Prisma, solo
 * para pruebas. Vive en `tests/`, no en el código de la aplicación.
 *
 * Para simular la clave foránea y el filtro `publicOnly` necesita consultar
 * categorías. Depende del CONTRATO `CategoryRepository` (no de la clase en
 * memoria ni de Prisma), así respeta los límites entre módulos.
 */

import { randomUUID } from "node:crypto";

import type { CategoryRepository } from "../../../src/modules/categories/domain/category-repository.ts";
import { ConflictError, NotFoundError } from "../../../src/modules/shared/domain/errors.ts";
import type { NewProduct, Product, ProductChanges } from "../../../src/modules/products/domain/product.ts";
import type { ListProductsOptions, ProductRepository } from "../../../src/modules/products/domain/product-repository.ts";

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

  async findAll(options: ListProductsOptions = {}): Promise<Product[]> {
    let result = [...this.items.values()];
    if (options.categoryId) result = result.filter((p) => p.categoryId === options.categoryId);
    if (options.search) {
      const term = options.search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(term));
    }
    if (options.publicOnly) {
      const visible = await Promise.all(
        result.map(async (p) => p.isAvailable && (await this.categories.findById(p.categoryId))?.isActive === true),
      );
      result = result.filter((_, index) => visible[index]);
    }
    return result;
  }

  async create(data: NewProduct): Promise<Product> {
    if (!(await this.categories.findById(data.categoryId))) {
      throw new NotFoundError("Categoría", data.categoryId); // simula la clave foránea
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
