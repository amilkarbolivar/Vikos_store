import { formatPrice } from "./format-price";

/**
 * ============================================================================
 * UTILIDADES DE WHATSAPP
 * ============================================================================
 * Funciones puras (sin React ni variables de entorno): reciben todo por parámetro,
 * así se pueden probar y reutilizar. Los componentes se encargan de pasarles la
 * configuración de `siteConfig`.
 */

/**
 * Arma el enlace que abre WhatsApp con un mensaje ya escrito.
 *
 * Usa el formato oficial `https://wa.me/<número>?text=<mensaje>`:
 * - En celular abre la app; en computador abre WhatsApp Web.
 * - El número debe ir solo con dígitos (se limpian "+", espacios y guiones).
 * - El mensaje se codifica para que los saltos de línea, tildes y emojis viajen bien.
 */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/** Datos mínimos de un producto necesarios para escribir el mensaje. */
interface ProductForMessage {
  name: string;
  /** Precio en pesos. */
  price: number;
  slug: string;
}

interface ProductMessageOptions {
  /** URL pública del sitio, sin barra final (para armar el enlace del producto). */
  siteUrl: string;
  greeting: string;
  closing: string;
}

/**
 * Escribe el mensaje que el cliente enviará por un producto. Resultado de ejemplo:
 *
 *   Hola 👋, me interesa este regalo:
 *
 *   🎁 Oso grande
 *   💰 $ 89.900
 *   🔗 https://mitienda.com/productos/oso-grande
 *
 *   ¿Me confirmas disponibilidad y tiempo de entrega?
 */
export function buildProductMessage(
  product: ProductForMessage,
  { siteUrl, greeting, closing }: ProductMessageOptions,
): string {
  return [
    greeting,
    "",
    `🎁 ${product.name}`,
    `💰 ${formatPrice(product.price)}`,
    `🔗 ${siteUrl}/productos/${product.slug}`,
    "",
    closing,
  ].join("\n");
}
