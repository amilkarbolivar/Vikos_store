/**
 * Next.js entrega cada parámetro de la URL como texto, o como lista si se repite
 * (?aviso=a&aviso=b). Nos quedamos con el primero.
 */
export function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
