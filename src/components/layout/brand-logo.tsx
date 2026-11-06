import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/cn";
import { siteConfig } from "@/config/site";

/**
 * Logo de la tienda (imágenes con fondo transparente en `public/brand/`). Es un enlace a la portada.
 *  - `compact` (por defecto): palabra "Viko's" + "DETALLES", para el encabezado, donde el lema se leería muy pequeño.
 *  - `full`: logo completo con el lema "Lo hacemos con el corazón", para el pie de página.
 * Se cambia SOLO aquí y cambia en todo el sitio.
 * `unoptimized`: el archivo ya viene optimizado, así no depende del optimizador de Next.
 */
export function BrandLogo({ variant = "compact" }: { variant?: "compact" | "full" }) {
  const full = variant === "full";
  return (
    <Link href="/" className="flex items-center" aria-label={`${siteConfig.name}, ir al inicio`}>
      <Image
        src={full ? "/brand/logo.webp" : "/brand/logo-compacto.webp"}
        alt={siteConfig.name}
        width={full ? 800 : 640}
        height={full ? 535 : 358}
        unoptimized
        priority={!full}
        className={cn("w-auto", full ? "h-28" : "h-12")}
      />
    </Link>
  );
}
