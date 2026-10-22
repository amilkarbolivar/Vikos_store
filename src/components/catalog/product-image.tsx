import Image from "next/image";

import { cn } from "@/lib/cn";

import { GiftIcon } from "../ui/icons";

interface ProductImageProps {
  /** URL de la foto, o `null` si el producto no tiene. */
  src: string | null;
  /** Texto alternativo: describe la imagen para lectores de pantalla y si no carga. */
  alt: string;
  /** Marcar `true` SOLO para la imagen principal visible al abrir la página (carga prioritaria). */
  priority?: boolean;
  /** Clases del contenedor: aquí se define la proporción (ej. "aspect-square"). */
  className?: string;
  /** Clases de la <img> (ej. el zoom al pasar el mouse). */
  imageClassName?: string;
}

/**
 * Imagen de un producto con "plan B" cuando no tiene foto.
 *
 * - El contenedor es relativo y la imagen lo llena (`fill` + `object-cover`), así todas las
 *   fotos quedan del mismo tamaño aunque originalmente sean distintas.
 * - `unoptimized`: las URLs de las fotos las escribe el administrador y pueden venir de
 *   cualquier dominio. Con esta opción Next.js las sirve tal cual, sin exigir registrar cada
 *   dominio en next.config. (Si algún día las fotos se alojan en un dominio propio, se puede
 *   quitar y configurar `images.remotePatterns` para optimizarlas automáticamente.)
 */
export function ProductImage({ src, alt, priority, className, imageClassName }: ProductImageProps) {
  return (
    <div className={cn("relative overflow-hidden bg-brand-50", className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized
          priority={priority}
          className={cn("object-cover", imageClassName)}
        />
      ) : (
        // Sin foto: degradado con una caja de regalo (decorativo, el nombre ya está en el texto).
        <div className="flex size-full items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 text-5xl text-brand-500/70">
          <GiftIcon aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
