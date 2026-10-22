import { siteConfig } from "@/config/site";
import { buildProductMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import type { Product } from "@/types/catalog";

import { ButtonLink } from "../ui/button";
import { WhatsAppIcon } from "../ui/icons";

interface ProductWhatsAppButtonProps {
  product: Product;
  /** Texto visible del botón. */
  label?: string;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  /** Clases extra (por ejemplo, para ajustar el relleno según el lugar donde se use). */
  className?: string;
}

/**
 * Botón "Pedir por WhatsApp" de UN producto.
 *
 * Reemplaza al clásico "Añadir al carrito": en lugar de un carrito, abre WhatsApp con un
 * mensaje ya escrito que incluye el nombre, el precio y el enlace del producto, de modo que
 * el cliente solo tiene que pulsar "Enviar".
 *
 * Es un componente de servidor: el enlace se calcula al renderizar, no hace falta JavaScript
 * en el navegador.
 */
export function ProductWhatsAppButton({
  product,
  label = "Pedir por WhatsApp",
  size = "md",
  fullWidth,
  className,
}: ProductWhatsAppButtonProps) {
  const message = buildProductMessage(product, {
    siteUrl: siteConfig.url,
    greeting: siteConfig.whatsapp.productGreeting,
    closing: siteConfig.whatsapp.productClosing,
  });

  return (
    <ButtonLink
      href={buildWhatsAppUrl(siteConfig.whatsapp.number, message)}
      variant="whatsapp"
      size={size}
      fullWidth={fullWidth}
      className={className}
      // El nombre accesible incluye el texto visible + el producto, para que quien usa lector
      // de pantalla sepa de cuál producto se trata cuando hay muchos botones iguales.
      aria-label={`${label}: ${product.name}`}
    >
      <WhatsAppIcon />
      {label}
    </ButtonLink>
  );
}
