/**
 * Caso de uso: crear una categoría.
 *
 * Capa `application`: coordina reglas del dominio y el repositorio, pero no sabe
 * si lo llama una ruta API, una Server Action o una prueba. Ese es justamente el
 * punto: la regla se escribe una vez y se reutiliza desde cualquier borde.
 *
 * Autorización: este caso de uso NO verifica quién llama. Esa responsabilidad es
 * de la capa de presentación (`requireAdmin()` en la Fase 4), que debe ejecutarse
 * ANTES de invocar cualquier operación de escritura.
 *
 * Unicidad del slug: se comprueba aquí para dar un error claro, pero dos
 * peticiones simultáneas podrían pasar la comprobación a la vez. Por eso la base
 * de datos también tiene un índice UNIQUE y el repositorio traduce esa violación
 * a `ConflictError`.
 */

import { ConflictError } from "../../shared/domain/errors.ts";
import { resolveSlug } from "../../shared/domain/slug.ts";
import {
  normalizeCategoryDescription,
  normalizeCategoryName,
  type Category,
} from "../domain/category.ts";
import type { CategoryRepository } from "../domain/category-repository.ts";

export interface CreateCategoryInput {
  name: string;
  /** Opcional: si se omite se deriva del nombre. */
  slug?: string;
  description?: string | null;
}

export class CreateCategory {
  private readonly categories: CategoryRepository;

  constructor(deps: { categories: CategoryRepository }) {
    this.categories = deps.categories;
  }

  /**
   * @throws ValidationError si el nombre, slug o descripción no son válidos.
   * @throws ConflictError si ya existe una categoría con ese slug.
   */
  async execute(input: CreateCategoryInput): Promise<Category> {
    // Se revalida aunque la ruta ya use Zod: el dominio no confía en quien lo llama.
    const name = normalizeCategoryName(input.name);
    const slug = resolveSlug(input.slug, name);
    const description = normalizeCategoryDescription(input.description);

    if (await this.categories.findBySlug(slug)) {
      throw new ConflictError(`Ya existe una categoría con el slug "${slug}".`);
    }

    return this.categories.create({ name, slug, description, isActive: true });
  }
}
