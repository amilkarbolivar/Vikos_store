import { siteConfig } from "@/config/site";
import { getCategories } from "@/services/catalog-service";

import { Skeleton } from "../ui/skeleton";
import { HeaderNavLink } from "./header-nav-link";

interface HeaderCategoryLinksProps {
  variant?: "desktop" | "mobile";
}

/**
 * Enlaces a las primeras categorías, tomadas de la API (las mismas que ve la tienda).
 *
 * Es un componente ASYNC de servidor, así que debe usarse dentro de <Suspense> (ver
 * SiteHeader): el encabezado aparece al instante y estos enlaces se completan cuando
 * llegan los datos. Cuántas se muestran se define en `siteConfig.headerCategoryLimit`;
 * el resto se elige con el selector de categoría de la tienda.
 *
 * Si la API falla, NO se rompe el encabezado: simplemente no se muestran las categorías.
 */
export async function HeaderCategoryLinks({ variant = "desktop" }: HeaderCategoryLinksProps) {
  let categories;
  try {
    categories = await getCategories();
  } catch {
    return null;
  }

  return categories.slice(0, siteConfig.headerCategoryLimit).map((category) => (
    <HeaderNavLink key={category.id} href={`/categorias/${category.slug}`} title={category.name} variant={variant} truncatable>
      {category.name}
    </HeaderNavLink>
  ));
}

/** Marcador de posición (barras grises) mientras llegan las categorías. */
export function HeaderCategoryLinksSkeleton({ variant = "desktop" }: HeaderCategoryLinksProps) {
  return Array.from({ length: siteConfig.headerCategoryLimit }, (_, index) => (
    <li key={index} aria-hidden="true">
      <Skeleton className={variant === "desktop" ? "mx-3 h-4 w-20" : "mx-3 my-3 h-4 w-32"} />
    </li>
  ));
}
