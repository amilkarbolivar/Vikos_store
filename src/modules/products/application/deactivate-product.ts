/**
 * Caso de uso: desactivar un producto (borrado lógico).
 *
 * Es la forma recomendada de "quitar" un producto de la tienda: lo oculta
 * (`isAvailable = false`) pero conserva el registro. Cuando existan pedidos,
 * sus líneas seguirán apuntando a un producto real y el historial de ventas no
 * se corrompe. Para eliminarlo de verdad existe `DeleteProduct`.
 *
 * Es idempotente: desactivar algo ya desactivado no produce error ni escritura.
 */

import { NotFoundError } from "../../shared/domain/errors.ts";
import type { Product } from "../domain/product.ts";
import type { ProductRepository } from "../domain/product-repository.ts";

export class DeactivateProduct {
  private readonly products: ProductRepository;

  constructor(deps: { products: ProductRepository }) {
    this.products = deps.products;
  }

  /** @throws NotFoundError si el producto no existe. */
  async execute(id: string): Promise<Product> {
    const current = await this.products.findById(id);
    if (!current) throw new NotFoundError("Producto", id);
    if (!current.isAvailable) return current;
    return this.products.update(id, { isAvailable: false });
  }
}
