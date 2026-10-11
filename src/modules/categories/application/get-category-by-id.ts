/**
 * Caso de uso: obtener una categoría por su identificador.
 *
 * Lo usa el panel administrativo (formularios de edición). Devuelve la
 * categoría aunque esté inactiva: el panel debe poder verla y reactivarla.
 * Quien exponga datos al público (la tienda) debe comprobar `isActive` y
 * responder 404 si es `false`; esa decisión de visibilidad pertenece a la
 * capa de presentación, no a este caso de uso.
 */

import { NotFoundError } from "../../shared/domain/errors.ts";
import type { Category } from "../domain/category.ts";
import type { CategoryRepository } from "../domain/category-repository.ts";

export class GetCategoryById {
  private readonly categories: CategoryRepository;

  constructor(deps: { categories: CategoryRepository }) {
    this.categories = deps.categories;
  }

  /** @throws NotFoundError si la categoría no existe. */
  async execute(id: string): Promise<Category> {
    const category = await this.categories.findById(id);
    if (!category) throw new NotFoundError("Categoría", id);
    return category;
  }
}
