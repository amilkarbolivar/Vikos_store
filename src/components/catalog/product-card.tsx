import Link from "next/link";

import type { Product } from "@/types/catalog";

import { ProductWhatsAppButton } from "../whatsapp/product-whatsapp-button";
import { PriceTag } from "./price-tag";
import { ProductImage } from "./product-image";

interface ProductCardProps {
  product: Product;
  /** `true` para las primeras tarjetas visibles al cargar: sus fotos se descargan primero. */
  priority?: boolean;
}

/**
 * Tarjeta de un producto en las cuadrículas: foto, nombre, precio y botón de WhatsApp.
 *
 * Accesibilidad: la foto y el nombre llevan al mismo sitio. Para que un lector de pantalla
 * no lea dos enlaces iguales, el enlace de la foto se oculta (`aria-hidden`) y se saca del
 * orden del teclado (`tabIndex={-1}`); el del nombre es el enlace "oficial". Con el mouse
 * se puede pulsar cualquiera de los dos.
 */
export function ProductCard({ product, priority }: ProductCardProps) {
  const href = `/productos/${product.slug}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-card border border-line bg-white shadow-card transition-shadow duration-200 hover:shadow-card-hover">
      <Link href={href} tabIndex={-1} aria-hidden="true">
        <ProductImage
          src={product.imageUrl}
          alt=""
          priority={priority}
          className="aspect-square"
          imageClassName="transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <h3 className="line-clamp-2 min-h-[2.75rem] text-sm font-semibold leading-snug text-ink sm:text-base">
          <Link href={href} className="hover:text-brand-700">
            {product.name}
          </Link>
        </h3>

        <PriceTag price={product.price} />

        {/* `mt-auto` empuja el botón al fondo: todos quedan alineados aunque los nombres tengan distinto largo. */}
        <div className="mt-auto pt-1">
          {/* `px-3` en celular: las tarjetas son estrechas (2 por fila) y el texto debe caber en una línea. */}
          <ProductWhatsAppButton product={product} label="Pedir ahora" size="sm" fullWidth className="px-3 sm:px-4" />
        </div>
      </div>
    </article>
  );
}
