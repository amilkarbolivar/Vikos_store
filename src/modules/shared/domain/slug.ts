import { ValidationError } from './errors';

/**
 * Normaliza un texto a un slug: minúsculas, sin tildes, solo [a-z0-9] separados por guiones.
 * "Caja de Regalo Ñandú 2024!" -> "caja-de-regalo-nandu-2024"
 */
export const SLUG_MAX_LENGTH = 80;

export function slugify(text: string, maxLength = SLUG_MAX_LENGTH): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLength)
    .replace(/-+$/g, '');
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** `true` si el texto ya es un slug bien formado (minúsculas, dígitos y guiones simples). */
export function isValidSlug(value: string, maxLength = SLUG_MAX_LENGTH): boolean {
  return value.length > 0 && value.length <= maxLength && SLUG_PATTERN.test(value);
}

/**
 * Slug final de un recurso: el explícito si se envió (debe ser válido, no se transforma)
 * o, si viene vacío/ausente, el derivado del nombre.
 *
 * @throws ValidationError si el slug explícito es inválido o no se puede derivar uno.
 */
export function resolveSlug(
  explicit: string | null | undefined,
  name: string,
  maxLength = SLUG_MAX_LENGTH,
): string {
  const provided = explicit?.trim() ?? '';
  if (provided) {
    if (!isValidSlug(provided, maxLength)) {
      throw new ValidationError(
        'El slug solo admite minúsculas, números y guiones simples.',
        'slug',
      );
    }
    return provided;
  }
  const derived = slugify(name, maxLength);
  if (!derived) {
    throw new ValidationError('No se pudo generar un slug válido a partir del nombre.', 'slug');
  }
  return derived;
}
