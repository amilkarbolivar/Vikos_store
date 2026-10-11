/**
 * Utilidades para trabajar con "slugs": identificadores legibles para URLs
 * (por ejemplo `caja-de-chocolates`) que usan las páginas /productos/[slug]
 * y /categorias/[slug].
 *
 * Son funciones puras (sin I/O), por eso viven en el dominio y se prueban
 * sin base de datos.
 *
 * Seguridad: restringir el slug a `a-z`, `0-9` y guiones evita que un valor
 * malicioso termine en una URL o en una ruta de archivo con caracteres
 * peligrosos. La unicidad NO se garantiza aquí: la comprueban los casos de uso
 * y, en última instancia, la restricción UNIQUE de PostgreSQL.
 */

import { ValidationError } from "./errors.ts";

export const SLUG_MAX_LENGTH = 80;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Convierte un texto libre en un slug.
 * Quita tildes ("Ñandú" -> "nandu"), pasa a minúsculas y reemplaza
 * cualquier secuencia no alfanumérica por un único guion.
 * Devuelve "" si el texto no contiene ningún carácter aprovechable.
 */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/-+$/, "");
}

export function isValidSlug(slug: string): boolean {
  return slug.length > 0 && slug.length <= SLUG_MAX_LENGTH && SLUG_PATTERN.test(slug);
}

/**
 * Decide el slug definitivo de una entidad.
 *
 * - Si el usuario envió uno explícito, se valida tal cual (no se "arregla" en silencio).
 * - Si no, se deriva del nombre.
 *
 * @throws ValidationError si el slug explícito es inválido o no se puede derivar uno.
 */
export function resolveSlug(explicitSlug: string | undefined, nameSource: string): string {
  const explicit = explicitSlug?.trim();

  if (explicit) {
    if (!isValidSlug(explicit)) {
      throw new ValidationError(
        `El slug solo admite minúsculas, números y guiones (máx. ${SLUG_MAX_LENGTH} caracteres).`,
        "slug",
      );
    }
    return explicit;
  }

  const derived = slugify(nameSource);
  if (!derived) {
    throw new ValidationError("No se pudo generar un slug a partir del nombre.", "slug");
  }
  return derived;
}
