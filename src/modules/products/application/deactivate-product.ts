import { ProductNotFoundError } from '../domain/errors';
import type { Product } from '../domain/product';
import type { ProductRepository } from '../domain/product-repository';

/**
 * Desactiva un producto (borrado lógico): lo oculta de la tienda (`isAvailable = false`) pero
 * conserva el registro, de modo que los pedidos futuros sigan apuntando a un producto real.
 * Para eliminarlo de verdad existe `DeleteProduct`. Es idempotente.
 */
export class DeactivateProduct {
  constructor(private readonly products: ProductRepository) {}

  /** @throws ProductNotFoundError si no existe. */
  async execute(id: string): Promise<Product> {
    const current = await this.products.findById(id);
    if (!current) throw new ProductNotFoundError();
    if (!current.isAvailable) return current;
    return this.products.update(id, { isAvailable: false });
  }
}
