import { isUuid } from '../../shared/domain/uuid';
import { ProductNotFoundError } from '../domain/errors';
import type { Product } from '../domain/product';
import type { ProductRepository } from '../domain/product-repository';
import type { CategoryReader } from './create-product';

/**
 * Producto tal como lo ve el visitante de la tienda, por id o por slug.
 *
 * Solo es visible si está disponible y su categoría (si tiene) está activa. En cualquier otro
 * caso responde "no existe": no se revela que el producto está oculto. Es la misma regla que
 * aplica el listado público (`onlyAvailable`).
 */
export class GetPublicProduct {
  constructor(
    private readonly products: ProductRepository,
    private readonly categories: CategoryReader,
  ) {}

  /** @throws ProductNotFoundError si no existe o no es visible al público. */
  async execute(idOrSlug: string): Promise<Product> {
    const product = isUuid(idOrSlug)
      ? await this.products.findById(idOrSlug)
      : await this.products.findBySlug(idOrSlug);

    if (!product || !product.isAvailable) throw new ProductNotFoundError();

    if (product.categoryId !== null) {
      const category = await this.categories.findById(product.categoryId);
      if (category && !category.isActive) throw new ProductNotFoundError();
    }
    return product;
  }
}
