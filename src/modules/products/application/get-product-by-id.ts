import { ProductNotFoundError } from '../domain/errors';
import type { Product } from '../domain/product';
import type { ProductRepository } from '../domain/product-repository';

/**
 * Obtiene un producto por id, esté o no disponible: el panel de administración debe poder
 * verlo y reactivarlo. La visibilidad pública la decide `GetPublicProduct`.
 */
export class GetProductById {
  constructor(private readonly products: ProductRepository) {}

  /** @throws ProductNotFoundError si no existe. */
  async execute(id: string): Promise<Product> {
    const product = await this.products.findById(id);
    if (!product) throw new ProductNotFoundError();
    return product;
  }
}
