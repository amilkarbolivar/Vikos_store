import {
  CategoryInactiveError,
  CategoryNotFoundError,
  DuplicateSlugError,
  ProductNotFoundError,
} from '../domain/errors';
import type { Product } from '../domain/product';
import type { ProductChanges, ProductRepository } from '../domain/product-repository';
import { buildProductChanges, type ProductUpdateDraft } from '../domain/product-rules';
import type { CategoryReader } from './create-product';

export type UpdateProductInput = ProductUpdateDraft;

/**
 * Actualización parcial de un producto.
 *
 *  - Solo se validan y aplican los campos enviados.
 *  - El slug NO cambia al renombrar (las URLs públicas se mantienen estables); solo cambia si se
 *    envía de forma explícita.
 *  - Si cambia la categoría, la nueva debe existir y estar activa. Si conserva la suya no se exige
 *    que siga activa: se puede seguir editando un producto cuya categoría fue desactivada
 *    (por ejemplo, para moverlo a otra).
 *  - Los cambios que no modifican nada no producen escritura.
 */
export class UpdateProduct {
  constructor(
    private readonly products: ProductRepository,
    private readonly categories: CategoryReader,
  ) {}

  /**
   * @throws ProductNotFoundError si el producto no existe.
   * @throws ValidationError si algún dato es inválido.
   * @throws CategoryNotFoundError | CategoryInactiveError si la nueva categoría no sirve.
   * @throws DuplicateSlugError si el slug pertenece a otro producto.
   */
  async execute(id: string, input: UpdateProductInput): Promise<Product> {
    const current = await this.products.findById(id);
    if (!current) throw new ProductNotFoundError();

    const requested = buildProductChanges(input, current.name);
    const changes: ProductChanges = {};

    if (requested.name !== undefined && requested.name !== current.name) {
      changes.name = requested.name;
    }
    if (requested.description !== undefined && requested.description !== current.description) {
      changes.description = requested.description;
    }
    if (requested.priceInCents !== undefined && requested.priceInCents !== current.priceInCents) {
      changes.priceInCents = requested.priceInCents;
    }
    if (requested.isAvailable !== undefined && requested.isAvailable !== current.isAvailable) {
      changes.isAvailable = requested.isAvailable;
    }
    if (requested.imageUrl !== undefined && requested.imageUrl !== current.imageUrl) {
      changes.imageUrl = requested.imageUrl;
    }

    const newCategoryId = requested.categoryId;
    if (newCategoryId != null && newCategoryId !== current.categoryId) {
      const category = await this.categories.findById(newCategoryId);
      if (!category) throw new CategoryNotFoundError();
      if (!category.isActive) throw new CategoryInactiveError();
      changes.categoryId = newCategoryId;
    }

    if (requested.slug !== undefined && requested.slug !== current.slug) {
      const owner = await this.products.findBySlug(requested.slug);
      if (owner && owner.id !== id) throw new DuplicateSlugError();
      changes.slug = requested.slug;
    }

    if (Object.keys(changes).length === 0) return current;

    return this.products.update(id, changes);
  }
}
