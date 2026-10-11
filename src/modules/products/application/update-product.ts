/**
 * Caso de uso: actualizar un producto.
 *
 * Reglas:
 *  - Solo se validan y aplican los campos enviados (actualización parcial).
 *  - El slug NO cambia al renombrar el producto (mantiene estables las URLs
 *    públicas); solo cambia si se envía explícitamente.
 *  - Si se cambia la categoría, la nueva debe existir y estar activa. Si el
 *    producto conserva su categoría, no se exige que siga activa: se puede
 *    seguir editando un producto cuya categoría fue desactivada (por ejemplo,
 *    para moverlo a otra).
 *  - El precio se revalida siempre en el dominio; nunca se confía en el cliente.
 */

import { BusinessRuleError, ConflictError, NotFoundError } from "../../shared/domain/errors.ts";
import { resolveSlug } from "../../shared/domain/slug.ts";
import type { CategoryRepository } from "../../categories/domain/category-repository.ts";
import {
  normalizeImageUrl,
  normalizeProductDescription,
  normalizeProductName,
  validatePriceInCents,
  type Product,
  type ProductChanges,
} from "../domain/product.ts";
import type { ProductRepository } from "../domain/product-repository.ts";

export interface UpdateProductInput {
  name?: string;
  slug?: string;
  description?: string;
  priceInCents?: number;
  categoryId?: string;
  /** `null` o vacío elimina la imagen; `undefined` la deja igual. */
  imageUrl?: string | null;
  isAvailable?: boolean;
}

export class UpdateProduct {
  private readonly products: ProductRepository;
  private readonly categories: CategoryRepository;

  constructor(deps: { products: ProductRepository; categories: CategoryRepository }) {
    this.products = deps.products;
    this.categories = deps.categories;
  }

  /**
   * @throws NotFoundError si el producto o la nueva categoría no existen.
   * @throws ValidationError si algún dato es inválido.
   * @throws BusinessRuleError si la nueva categoría está inactiva.
   * @throws ConflictError si el nuevo slug pertenece a otro producto.
   */
  async execute(id: string, input: UpdateProductInput): Promise<Product> {
    const current = await this.products.findById(id);
    if (!current) throw new NotFoundError("Producto", id);

    const changes: ProductChanges = {};

    if (input.name !== undefined) changes.name = normalizeProductName(input.name);
    if (input.description !== undefined) {
      changes.description = normalizeProductDescription(input.description);
    }
    if (input.priceInCents !== undefined) {
      changes.priceInCents = validatePriceInCents(input.priceInCents);
    }
    if (input.imageUrl !== undefined) changes.imageUrl = normalizeImageUrl(input.imageUrl);
    if (input.isAvailable !== undefined) changes.isAvailable = input.isAvailable;

    if (input.categoryId !== undefined && input.categoryId !== current.categoryId) {
      const category = await this.categories.findById(input.categoryId);
      if (!category) throw new NotFoundError("Categoría", input.categoryId);
      if (!category.isActive) {
        throw new BusinessRuleError(
          `La categoría "${category.name}" está inactiva y no admite productos.`,
        );
      }
      changes.categoryId = category.id;
    }

    if (input.slug !== undefined) {
      const slug = resolveSlug(input.slug, changes.name ?? current.name);
      if (slug !== current.slug) {
        const owner = await this.products.findBySlug(slug);
        if (owner && owner.id !== id) {
          throw new ConflictError(`Ya existe un producto con el slug "${slug}".`);
        }
        changes.slug = slug;
      }
    }

    if (Object.keys(changes).length === 0) return current;

    return this.products.update(id, changes);
  }
}
