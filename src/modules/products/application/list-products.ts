import type { Product } from '../domain/product';
import type { ProductListFilter, ProductRepository } from '../domain/product-repository';

/** Alias para quien ya importaba `ListProductsOptions`. */
export type ListProductsOptions = ProductListFilter;

export class ListProducts {
  constructor(private readonly products: ProductRepository) {}

  async execute(options: ProductListFilter = {}): Promise<Product[]> {
    return this.products.list(options);
  }
}