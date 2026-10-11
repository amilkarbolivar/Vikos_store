/**
 * Caso de uso: listar productos.
 *
 * - Catálogo público: `execute({ publicOnly: true })` (disponibles y con
 *   categoría activa).
 * - Por categoría: `execute({ publicOnly: true, categoryId })`.
 * - Panel administrativo: `execute()` devuelve todo.
 *
 * Paginación: se pospone a propósito. Con un catálogo pequeño añadiría
 * complejidad sin beneficio; cuando crezca se incorpora `page`/`pageSize` aquí
 * y en el repositorio sin cambiar a quienes llaman (parámetros opcionales).
 */

import type { Product } from "../domain/product.ts";
import type { ListProductsOptions, ProductRepository } from "../domain/product-repository.ts";

export class ListProducts {
  private readonly products: ProductRepository;

  constructor(deps: { products: ProductRepository }) {
    this.products = deps.products;
  }

  async execute(options: ListProductsOptions = {}): Promise<Product[]> {
    const search = options.search?.trim();
    return this.products.findAll({
      ...options,
      // Una búsqueda vacía equivale a no filtrar.
      ...(search ? { search } : { search: undefined }),
    });
  }
}
