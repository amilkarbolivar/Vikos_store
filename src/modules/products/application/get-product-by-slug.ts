import { ProductNotFoundError } from '../domain/errors';
import type { Product } from '../domain/product';
import type { ProductRepository } from '../domain/product-repository';

/** Obtiene un producto por slug, esté o no disponible (uso administrativo). */
export class GetProductBySlug {
  constructor(private readonly products: ProductRepository) {}

  /** @throws ProductNotFoundError si no existe. */
  async execute(slug: string): Promise<Product> {
    const product = await this.products.findBySlug(slug);
    if (!product) throw new ProductNotFoundError();
    return product;
  }
}
