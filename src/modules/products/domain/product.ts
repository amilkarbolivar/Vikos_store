/**
 * Entidad `Product` y reglas de negocio de los productos.
 *
 * Pertenece al dominio: no depende de Prisma, Next.js, AWS ni React.
 *
 * DINERO: el precio se guarda como número ENTERO en centavos de peso colombiano
 * (`priceInCents`). Nunca como `float`: 0.1 + 0.2 !== 0.3 en coma flotante y
 * esos errores de redondeo son inaceptables al cobrar. Ejemplo: $45.900 COP se
 * guarda como 4_590_000. La conversión a texto ("$45.900") es un asunto de
 * presentación y se hace en la interfaz, no aquí.
 *
 * LÍMITE SUPERIOR: PostgreSQL `INTEGER` (el tipo `Int` de Prisma) admite hasta
 * 2.147.483.647. Fijamos 2.000.000.000 centavos (= $20.000.000 COP) como tope, lo
 * suficientemente alto para un regalo y garantizado de caber en la columna. Si
 * algún día se necesitan precios mayores, se migra la columna a BigInt y se
 * ajusta SOLO esta constante.
 */

import { ValidationError } from "../../shared/domain/errors.ts";

export const PRODUCT_NAME_MAX_LENGTH = 120;
export const PRODUCT_DESCRIPTION_MAX_LENGTH = 2000;
export const PRODUCT_PRICE_MAX_IN_CENTS = 2_000_000_000;
export const PRODUCT_IMAGE_URL_MAX_LENGTH = 2048;

/** Producto tal como existe en el negocio (ya persistido). */
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  /** Precio en centavos de COP. Entero positivo. */
  priceInCents: number;
  categoryId: string;
  imageUrl: string | null;
  /** `false` = oculto en la tienda (sin stock o retirado), pero conservado. */
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Datos para crear un producto. El id y las fechas los asigna la persistencia. */
export interface NewProduct {
  name: string;
  slug: string;
  description: string;
  priceInCents: number;
  categoryId: string;
  imageUrl: string | null;
  isAvailable: boolean;
}

/** Cambios parciales permitidos al actualizar. Solo se aplican las claves presentes. */
export interface ProductChanges {
  name?: string;
  slug?: string;
  description?: string;
  priceInCents?: number;
  categoryId?: string;
  imageUrl?: string | null;
  isAvailable?: boolean;
}

/**
 * Valida el precio. Rechaza decimales, cero, negativos, NaN/Infinity y valores
 * por encima del tope. `Number.isInteger` ya descarta NaN e Infinity.
 */
export function validatePriceInCents(value: number): number {
  if (!Number.isInteger(value)) {
    throw new ValidationError("El precio debe ser un número entero de centavos.", "priceInCents");
  }
  if (value <= 0) {
    throw new ValidationError("El precio debe ser mayor que cero.", "priceInCents");
  }
  if (value > PRODUCT_PRICE_MAX_IN_CENTS) {
    throw new ValidationError("El precio supera el máximo permitido.", "priceInCents");
  }
  return value;
}

export function normalizeProductName(raw: string): string {
  const name = raw.trim().replace(/\s+/g, " ");
  if (!name) {
    throw new ValidationError("El nombre del producto es obligatorio.", "name");
  }
  if (name.length > PRODUCT_NAME_MAX_LENGTH) {
    throw new ValidationError(
      `El nombre no puede superar ${PRODUCT_NAME_MAX_LENGTH} caracteres.`,
      "name",
    );
  }
  return name;
}

/** La descripción puede quedar vacía, pero no excede el máximo. */
export function normalizeProductDescription(raw: string | undefined): string {
  const description = raw?.trim() ?? "";
  if (description.length > PRODUCT_DESCRIPTION_MAX_LENGTH) {
    throw new ValidationError(
      `La descripción no puede superar ${PRODUCT_DESCRIPTION_MAX_LENGTH} caracteres.`,
      "description",
    );
  }
  return description;
}

/**
 * Valida la URL de la imagen. Solo se aceptan `https:` y `http:`; esquemas como
 * `javascript:` o `data:` se rechazan porque acabarían en un atributo `src`/`href`
 * de la tienda (riesgo de XSS). Vacío o `null` significa "sin imagen".
 */
export function normalizeImageUrl(raw: string | null | undefined): string | null {
  const value = raw?.trim() ?? "";
  if (!value) return null;

  if (value.length > PRODUCT_IMAGE_URL_MAX_LENGTH) {
    throw new ValidationError("La URL de la imagen es demasiado larga.", "imageUrl");
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new ValidationError("La URL de la imagen no es válida.", "imageUrl");
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new ValidationError("La imagen debe usar una URL http o https.", "imageUrl");
  }
  return value;
}
