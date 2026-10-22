/**
 * Une clases CSS ignorando los valores "vacíos" (false, null, undefined, "").
 * Sirve para aplicar clases condicionales sin ensuciar el JSX:
 *
 *   cn("px-4", isActive && "bg-brand-600", className)
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
