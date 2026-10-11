/**
 * Caso de uso: crear un producto.
 *
 * Coordina las reglas de negocio ANTES de guardar:
 *  1. Valida y normaliza los datos (nombre, precio, descripción, imagen, slug).
 *  2. Comprueba que la categoría exista y esté ACTIVA.
 *  3. Comprueba que el slug no esté en uso.
 *  4. Delega la persistencia al repositorio inyectado.
 *
 * Dependencia entre módulos: `products` usa el CONTRATO `CategoryRepository` del
 * dominio de `categories`, nunca su infraestructura. Es la forma permitida de
 * relacionar módulos en un monolito modular: dependencia hacia interfaces.
 *
 * Integridad: aunque aquí se verifique la categoría, la clave foránea en
 * PostgreSQL es la garantía definitiva (otra petición podría borrar o cambiar la
 * categoría entre la comprobación y el guardado).
 *
 * Autorización: la verifica la capa de presentación antes de llamar a este caso
 * de uso (ver `requireAdmin()`, Fase 4).
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
} from "../domain/product.ts";
import type { ProductRepository } from "../domain/product-repository.ts";

export interface CreateProductInput {
  name: string;
  slug?: string;
  description?: string;
  /** Centavos de COP. Se valida en el dominio. */
  priceInCents: number;
  categoryId: string;
  imageUrl?: string | null;
  /** Por defecto `true`. */
  isAvailable?: boolean;
}

export class CreateProduct {
  private readonly products: ProductRepository;
  private readonly categories: CategoryRepository;

  constructor(deps: { products: ProductRepository; categories: CategoryRepository }) {
    this.products = deps.products;
    this.categories = deps.categories;
  }

  /**
   * @throws ValidationError si algún dato es inválido (precio, nombre, slug, imagen).
   * @throws NotFoundError si la categoría no existe.
   * @throws BusinessRuleError si la categoría está inactiva.
   * @throws ConflictError si el slug ya está en uso.
   */
  async execute(input: CreateProductInput): Promise<Product> {
    const name = normalizeProductName(input.name);
    const priceInCents = validatePriceInCents(input.priceInCents);
    const description = normalizeProductDescription(input.description);
    const imageUrl = normalizeImageUrl(input.imageUrl);
    const slug = resolveSlug(input.slug, name);

    const category = await this.categories.findById(input.categoryId);
    if (!category) throw new NotFoundError("Categoría", input.categoryId);
    if (!category.isActive) {
      throw new BusinessRuleError(
        `La categoría "${category.name}" está inactiva y no admite productos nuevos.`,
      );
    }

    if (await this.products.findBySlug(slug)) {
      throw new ConflictError(`Ya existe un producto con el slug "${slug}".`);
    }

    return this.products.create({
      name,
      slug,
      description,
      priceInCents,
      categoryId: category.id,
      imageUrl,
      isAvailable: input.isAvailable ?? true,
    });
  }
}
