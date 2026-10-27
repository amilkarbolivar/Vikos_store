import { formatPrice } from "./format-price";

/**
 * ============================================================================
 * FILTROS DEL CATÁLOGO (lógica pura)
 * ============================================================================
 * Funciones sin React que traducen lo que el visitante elige (en la URL) a un filtro.
 * Se prueban solas; los componentes solo las llaman.
 */

/** Un rango de precios en pesos. `max` es "hasta" (incluido); `min` es "más de" (no incluido). */
export interface PriceRange {
  min?: number;
  max?: number;
}

/**
 * Identificador de un rango para usar en la URL: { min: 50000, max: 100000 } → "50000-100000".
 * Sin mínimo → "0-50000"; sin máximo → "200000-".
 */
export function priceRangeKey(range: PriceRange): string {
  return `${range.min ?? 0}-${range.max ?? ""}`;
}

/** Texto legible de un rango: "Hasta $50.000", "$50.000 – $100.000" o "Más de $200.000". */
export function priceRangeLabel(range: PriceRange): string {
  if (range.min === undefined && range.max !== undefined) return `Hasta ${formatPrice(range.max)}`;
  if (range.max === undefined && range.min !== undefined) return `Más de ${formatPrice(range.min)}`;
  return `${formatPrice(range.min ?? 0)} – ${formatPrice(range.max ?? 0)}`;
}

/**
 * Busca, entre los rangos PERMITIDOS, el que corresponde al texto de la URL.
 * Si el texto no coincide con ninguno (alguien lo escribió a mano, o el rango ya no existe),
 * devuelve `undefined` y simplemente no se filtra: nunca se interpreta texto libre.
 */
export function findPriceRange(
  key: string | undefined,
  ranges: readonly PriceRange[],
): PriceRange | undefined {
  if (!key) return undefined;
  return ranges.find((range) => priceRangeKey(range) === key);
}

/** Deja solo los elementos cuyo precio cae en el rango. Sin rango, devuelve todo. */
export function filterByPrice<T extends { price: number }>(items: T[], range?: PriceRange): T[] {
  if (!range) return items;
  return items.filter(
    ({ price }) =>
      (range.min === undefined || price > range.min) && (range.max === undefined || price <= range.max),
  );
}

/**
 * Next.js entrega cada parámetro de la URL como texto, o como lista si se repite
 * (?precio=a&precio=b). Nos quedamos con el primero.
 */
export function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
