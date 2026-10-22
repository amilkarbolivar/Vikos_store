import { siteConfig } from "@/config/site";

/**
 * Convierte un precio en pesos a texto legible: 89900 → "$ 89.900".
 *
 * - Usa el formato colombiano (punto para miles).
 * - No muestra decimales cuando el precio es entero (lo normal en una tienda).
 * - Si el precio sí trae centavos (por ejemplo 99900.5) los conserva, para no mentir.
 *
 * Es una función pura (sin React) para poder probarla fácilmente.
 */
export function formatPrice(
  pesos: number,
  { locale, code } = siteConfig.currency,
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(pesos);
}
