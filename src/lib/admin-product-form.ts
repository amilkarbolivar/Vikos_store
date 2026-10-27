/**
 * ============================================================================
 * LÓGICA PURA DEL FORMULARIO DE PRODUCTOS
 * ============================================================================
 * Sin React: convierte lo que escribe el administrador en lo que espera la API, y al revés.
 * Se prueba sola (tests/unit/admin-forms.test.ts). El componente solo la llama.
 *
 * PRECIO: se escribe SOLO con dígitos, en pesos enteros ("89900"). A propósito no se admiten
 * puntos ni comas: en Colombia "89.900" significa ochenta y nueve mil novecientos, pero la API
 * lo leería como 89,9 pesos. Quitar los símbolos al escribir elimina ese error de raíz.
 */
import type { FieldErrors } from "./admin-api-client";
import type { Product } from "@/types/catalog";

/** Lo que el formulario guarda de cada campo (todo texto, como un <input>). */
export interface ProductFormValues {
  name: string;
  slug: string;
  description: string;
  /** Solo dígitos. */
  price: string;
  categoryId: string;
  imageUrl: string;
  isAvailable: boolean;
}

export const emptyProductForm: ProductFormValues = {
  name: "",
  slug: "",
  description: "",
  price: "",
  categoryId: "",
  imageUrl: "",
  isAvailable: true,
};

/** Máximo de dígitos del precio (evita números absurdos; la API valida el tope real). */
const PRICE_MAX_DIGITS = 10;

/** Deja solo los dígitos, sin ceros a la izquierda: "89.900 $" → "89900", "007" → "7". */
export function sanitizePriceInput(raw: string): string {
  return raw.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, PRICE_MAX_DIGITS);
}

/** Valores iniciales del formulario al EDITAR un producto existente. */
export function productToFormValues(product: Product): ProductFormValues {
  return {
    name: product.name,
    slug: product.slug,
    description: product.description,
    // Redondeado: en pesos colombianos no hay centavos. (Si el precio original tenía
    // decimales y el usuario no lo toca, no se envía y se conserva tal cual: ver abajo.)
    price: String(Math.round(product.price)),
    categoryId: product.categoryId ?? "",
    imageUrl: product.imageUrl ?? "",
    isAvailable: product.isAvailable,
  };
}

/**
 * Comprobaciones rápidas ANTES de enviar, para avisar sin esperar al servidor.
 * No sustituyen a la API (que valida todo de nuevo): solo mejoran la experiencia.
 */
export function validateProductForm(values: ProductFormValues): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.name.trim()) errors.name = "El nombre es obligatorio.";
  if (!values.price || Number(values.price) <= 0) errors.price = "Escribe un precio mayor que cero.";
  if (!values.categoryId) errors.categoryId = "Elige una categoría.";
  return errors;
}

/** Cuerpo de POST /api/productos. Los opcionales vacíos se omiten. */
export function buildCreateProductPayload(values: ProductFormValues): Record<string, unknown> {
  const slug = values.slug.trim();
  const imageUrl = values.imageUrl.trim();

  return {
    name: values.name.trim(),
    description: values.description.trim(),
    price: Number(values.price),
    categoryId: values.categoryId,
    isAvailable: values.isAvailable,
    ...(slug ? { slug } : {}),
    ...(imageUrl ? { imageUrl } : {}),
  };
}

/**
 * Cuerpo de PATCH /api/productos/:id: SOLO los campos que el administrador cambió.
 * Enviar únicamente lo modificado evita pisar datos (por ejemplo, un precio con decimales que
 * el formulario muestra redondeado) y hace innecesaria la escritura si no hay cambios.
 * Devuelve un objeto vacío si no cambió nada.
 */
export function buildUpdateProductPayload(
  values: ProductFormValues,
  original: Product,
): Record<string, unknown> {
  const changes: Record<string, unknown> = {};

  const name = values.name.trim();
  if (name !== original.name) changes.name = name;

  const slug = values.slug.trim();
  // Slug vacío = "genéralo de nuevo a partir del nombre" (lo entiende la API).
  if (slug !== original.slug) changes.slug = slug;

  const description = values.description.trim();
  if (description !== original.description) changes.description = description;

  if (Number(values.price) !== Math.round(original.price)) changes.price = Number(values.price);

  if (values.categoryId !== (original.categoryId ?? "")) changes.categoryId = values.categoryId;

  const imageUrl = values.imageUrl.trim();
  // `null` = quitar la imagen.
  if (imageUrl !== (original.imageUrl ?? "")) changes.imageUrl = imageUrl || null;

  if (values.isAvailable !== original.isAvailable) changes.isAvailable = values.isAvailable;

  return changes;
}

/**
 * ¿Se puede mostrar esta URL como vista previa de imagen?
 *
 * Se usa mientras el administrador ESCRIBE la URL, así que pasa por estados incompletos
 * ("h", "https:", "https://"...). Solo se acepta una URL completa y bien formada con http(s)
 * y un dominio: pasarle a <Image> una URL a medias lanza una excepción y rompe el formulario.
 * También descarta esquemas peligrosos (javascript:, data:, ftp:...).
 */
export function isPreviewableImageUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return (url.protocol === "http:" || url.protocol === "https:") && url.hostname.length > 0;
  } catch {
    return false;
  }
}
