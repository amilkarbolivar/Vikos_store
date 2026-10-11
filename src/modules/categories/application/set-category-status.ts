/**
 * Casos de uso: desactivar y reactivar una categoría.
 *
 * ¿Qué pasa con los productos de una categoría desactivada?
 * Decisión: NO se tocan. Siguen existiendo en la base de datos y el panel
 * administrativo puede verlos y moverlos a otra categoría. La tienda pública
 * los oculta porque su consulta exige que la categoría esté activa
 * (`publicOnly` en `ProductRepository`). Reactivar la categoría los hace
 * visibles de nuevo sin perder información.
 *
 * Ambas operaciones son idempotentes: repetirlas no produce error ni escritura.
 */

import { NotFoundError } from "../../shared/domain/errors.ts";
import type { Category } from "../domain/category.ts";
import type { CategoryRepository } from "../domain/category-repository.ts";

async function setActive(
  categories: CategoryRepository,
  id: string,
  isActive: boolean,
): Promise<Category> {
  const current = await categories.findById(id);
  if (!current) throw new NotFoundError("Categoría", id);
  if (current.isActive === isActive) return current;
  return categories.update(id, { isActive });
}

export class DeactivateCategory {
  private readonly categories: CategoryRepository;

  constructor(deps: { categories: CategoryRepository }) {
    this.categories = deps.categories;
  }

  /** @throws NotFoundError si la categoría no existe. */
  execute(id: string): Promise<Category> {
    return setActive(this.categories, id, false);
  }
}

export class ReactivateCategory {
  private readonly categories: CategoryRepository;

  constructor(deps: { categories: CategoryRepository }) {
    this.categories = deps.categories;
  }

  /** @throws NotFoundError si la categoría no existe. */
  execute(id: string): Promise<Category> {
    return setActive(this.categories, id, true);
  }
}
