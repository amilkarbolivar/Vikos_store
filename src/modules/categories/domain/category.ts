/**
 * Entidad `Category` y reglas de negocio de las categorías.
 *
 * Pertenece al dominio: no importa Prisma, Next.js ni React. Si mañana cambia la
 * base de datos o el framework, este archivo no cambia.
 *
 * Las categorías nunca se borran: se DESACTIVAN (`isActive = false`). Motivo:
 * los productos las referencian con una clave foránea y borrar una categoría
 * con productos dejaría el catálogo roto u obligaría a borrar productos en
 * cascada, una pérdida de datos que nadie pidió. Desactivarla la oculta de la
 * tienda y bloquea nuevos productos en ella, sin destruir nada.
 */

import { ValidationError } from "../../shared/domain/errors.ts";

export const CATEGORY_NAME_MAX_LENGTH = 80;
export const CATEGORY_DESCRIPTION_MAX_LENGTH = 500;

/** Categoría tal como existe en el negocio (ya persistida). */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Datos necesarios para crear una categoría. El id y las fechas los asigna la persistencia. */
export interface NewCategory {
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
}

/** Cambios parciales permitidos al actualizar. Solo se aplican las claves presentes. */
export interface CategoryChanges {
  name?: string;
  slug?: string;
  description?: string | null;
  isActive?: boolean;
}

/**
 * Limpia y valida el nombre: recorta espacios, colapsa espacios internos
 * y rechaza vacíos o demasiado largos.
 */
export function normalizeCategoryName(raw: string): string {
  const name = raw.trim().replace(/\s+/g, " ");
  if (!name) {
    throw new ValidationError("El nombre de la categoría es obligatorio.", "name");
  }
  if (name.length > CATEGORY_NAME_MAX_LENGTH) {
    throw new ValidationError(
      `El nombre no puede superar ${CATEGORY_NAME_MAX_LENGTH} caracteres.`,
      "name",
    );
  }
  return name;
}

/** La descripción es opcional: un texto vacío se guarda como `null`. */
export function normalizeCategoryDescription(raw: string | null | undefined): string | null {
  const description = raw?.trim() ?? "";
  if (!description) return null;
  if (description.length > CATEGORY_DESCRIPTION_MAX_LENGTH) {
    throw new ValidationError(
      `La descripción no puede superar ${CATEGORY_DESCRIPTION_MAX_LENGTH} caracteres.`,
      "description",
    );
  }
  return description;
}
