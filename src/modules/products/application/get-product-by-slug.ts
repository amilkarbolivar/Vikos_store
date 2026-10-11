/**
 * Caso de uso: obtener un producto por su slug.
 *
 * Lo usa la tienda pública en /productos/[slug]. Devuelve el producto aunque no
 * esté disponible o su categoría esté inactiva; la página pública debe
 * responder 404 en esos casos (se implementa en la Fase 5), para que el panel
 * administrativo conserve acceso a todo.
 */

import { NotFoundError } from "../../shared/domain/errors.ts";
import type { Product } from "../domain/product.ts";
import type { ProductRepository } from "../domain/product-repository.ts";

export class GetProductBySlug {
  private readonly products: ProductRepository;

  constructor(deps: { products: ProductRepository }) {
    this.products = deps.products;
  }

  /** @throws NotFoundError si el producto no existe. */
  async execute(slug: string): Promise<Product> {
    const product = await this.products.findBySlug(slug);
    if (!product) throw new NotFoundError("Producto", slug);
    return product;
  }
}
