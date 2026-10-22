import Link from "next/link";

import { siteConfig } from "@/config/site";

import { GiftIcon } from "../ui/icons";

/**
 * Logo de la tienda: un icono + el nombre. Es un enlace a la portada.
 * Cuando haya un logo real (imagen), se reemplaza SOLO aquí y cambia en todo el sitio.
 */
export function BrandLogo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label={`${siteConfig.name}, ir al inicio`}>
      <span className="flex size-10 items-center justify-center rounded-xl bg-brand-600 text-xl text-white">
        <GiftIcon />
      </span>
      <span className="text-lg font-extrabold tracking-tight text-ink">{siteConfig.name}</span>
    </Link>
  );
}
