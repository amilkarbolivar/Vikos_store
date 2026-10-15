/**
 * Normaliza un texto a un slug: minúsculas, sin tildes, solo [a-z0-9] separados por guiones.
 * "Caja de Regalo Ñandú 2024!" -> "caja-de-regalo-nandu-2024"
 */
export function slugify(text: string, maxLength = 200): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLength)
    .replace(/-+$/g, '');
}
