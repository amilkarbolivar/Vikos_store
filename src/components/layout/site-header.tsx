import { Suspense } from "react";

import { siteConfig } from "@/config/site";

import { Container } from "../ui/container";
import { ContactWhatsAppButton } from "../whatsapp/contact-whatsapp-button";
import { BrandLogo } from "./brand-logo";
import { HeaderCategoryLinks, HeaderCategoryLinksSkeleton } from "./header-category-links";
import { HeaderNavLink } from "./header-nav-link";
import { MobileNav } from "./mobile-nav";

/**
 * Encabezado fijo (se queda arriba al hacer scroll). Estructura:
 *
 *   [ logo ]   [ Inicio · Sobre nosotros · Tienda · Categoría 1 · Categoría 2 · Categoría 3 ]
 *
 *  - Escritorio (≥ 1024px): logo a la izquierda y el menú ocupando el resto.
 *  - Celular / tablet: logo + botón de hamburguesa que abre `MobileNav`.
 *
 * Los enlaces fijos salen de `siteConfig.nav`; las categorías, de la API.
 * El menú queda dentro de <Suspense>: el encabezado se ve al instante aunque las categorías
 * tarden un poco en llegar.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-cream/90 backdrop-blur">
      <Container className="flex h-16 items-center gap-4 lg:gap-6">
        <BrandLogo />

        {/* Menú de escritorio: `flex-1` lo estira y `justify-evenly` reparte los enlaces. */}
        <nav aria-label="Principal" className="hidden min-w-0 flex-1 lg:block">
          <ul className="flex items-center justify-evenly gap-1">
            {siteConfig.nav.map((link) => (
              <HeaderNavLink key={link.href} href={link.href}>
                {link.label}
              </HeaderNavLink>
            ))}
            <Suspense fallback={<HeaderCategoryLinksSkeleton />}>
              <HeaderCategoryLinks />
            </Suspense>
          </ul>
        </nav>

        {/* Menú móvil: `ml-auto` lo empuja a la derecha. */}
        <div className="ml-auto lg:hidden">
          <MobileNav>
            {siteConfig.nav.map((link) => (
              <HeaderNavLink key={link.href} href={link.href} variant="mobile">
                {link.label}
              </HeaderNavLink>
            ))}
            <Suspense fallback={<HeaderCategoryLinksSkeleton variant="mobile" />}>
              <HeaderCategoryLinks variant="mobile" />
            </Suspense>
            <li className="pt-2">
              <ContactWhatsAppButton fullWidth />
            </li>
          </MobileNav>
        </div>
      </Container>
    </header>
  );
}
