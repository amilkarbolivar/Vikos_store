/**
 * Caso de uso: obtener una categoría por su slug.
 *
 * Lo usa la tienda pública en /categorias/[slug]. Igual que `GetCategoryById`,
 * devuelve también categorías inactivas; la página pública debe responder 404
 * cuando `isActive` sea `false`.
 */

import { NotFoundError } from "../../shared/domain/errors.ts";
import type { Category } from "../domain/category.ts";
import type { CategoryRepository } from "../domain/category-repository.ts";

export class GetCategoryBySlug {
  private readonly categories: CategoryRepository;

  constructor(deps: { categories: CategoryRepository }) {
    this.categories = deps.categories;
  }

  /** @throws NotFoundError si la categoría no existe. */
  async execute(slug: string): Promise<Category> {
    const category = await this.categories.findBySlug(slug);
    if (!category) throw new NotFoundError("Categoría", slug);
    return category;
  }
}
