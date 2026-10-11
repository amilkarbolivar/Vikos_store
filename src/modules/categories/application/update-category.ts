/**
 * Caso de uso: actualizar nombre, slug o descripción de una categoría.
 *
 * Decisión de diseño: el slug NO se regenera cuando cambia el nombre. Cambiar
 * una URL pública rompe enlaces compartidos y el posicionamiento en buscadores.
 * El slug solo cambia si quien edita lo envía de forma explícita.
 *
 * El estado activo/inactivo no se modifica aquí; tiene sus propios casos de uso
 * (`DeactivateCategory` / `ReactivateCategory`) para que la intención quede clara
 * en el código y en los registros de auditoría futuros.
 */

import { ConflictError, NotFoundError } from "../../shared/domain/errors.ts";
import { resolveSlug } from "../../shared/domain/slug.ts";
import {
  normalizeCategoryDescription,
  normalizeCategoryName,
  type Category,
  type CategoryChanges,
} from "../domain/category.ts";
import type { CategoryRepository } from "../domain/category-repository.ts";

export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  /** `null` o texto vacío borra la descripción; `undefined` la deja igual. */
  description?: string | null;
}

export class UpdateCategory {
  private readonly categories: CategoryRepository;

  constructor(deps: { categories: CategoryRepository }) {
    this.categories = deps.categories;
  }

  /**
   * @throws NotFoundError si la categoría no existe.
   * @throws ValidationError si algún dato es inválido.
   * @throws ConflictError si el nuevo slug pertenece a otra categoría.
   */
  async execute(id: string, input: UpdateCategoryInput): Promise<Category> {
    const current = await this.categories.findById(id);
    if (!current) throw new NotFoundError("Categoría", id);

    const changes: CategoryChanges = {};

    if (input.name !== undefined) {
      changes.name = normalizeCategoryName(input.name);
    }

    if (input.description !== undefined) {
      changes.description = normalizeCategoryDescription(input.description);
    }

    if (input.slug !== undefined) {
      // Se valida el formato del slug enviado (no se deriva del nombre).
      const slug = resolveSlug(input.slug, changes.name ?? current.name);
      if (slug !== current.slug) {
        const owner = await this.categories.findBySlug(slug);
        if (owner && owner.id !== id) {
          throw new ConflictError(`Ya existe una categoría con el slug "${slug}".`);
        }
        changes.slug = slug;
      }
    }

    // Sin cambios reales: se evita una escritura innecesaria.
    if (Object.keys(changes).length === 0) return current;

    return this.categories.update(id, changes);
  }
}
