/**
 * Caso de uso: obtener un producto por su identificador.
 *
 * Lo usa el panel administrativo (edición). Devuelve el producto aunque no esté
 * disponible: el administrador debe poder verlo y reactivarlo.
 */

import { NotFoundError } from "../../shared/domain/errors.ts";
import type { Product } from "../domain/product.ts";
import type { ProductRepository } from "../domain/product-repository.ts";

export class GetProductById {
  private readonly products: ProductRepository;

  constructor(deps: { products: ProductRepository }) {
    this.products = deps.products;
  }

  /** @throws NotFoundError si el producto no existe. */
  async execute(id: string): Promise<Product> {
    const product = await this.products.findById(id);
    if (!product) throw new NotFoundError("Producto", id);
    return product;
  }
}
