import Link from "next/link";

import { siteConfig } from "@/config/site";

import { Container } from "../ui/container";
import { ContactWhatsAppButton } from "../whatsapp/contact-whatsapp-button";
import { BrandLogo } from "./brand-logo";
import { MobileNav } from "./mobile-nav";

/**
 * Encabezado fijo (se queda arriba al hacer scroll).
 *  - Escritorio: logo + menú + botón de WhatsApp.
 *  - Celular: logo + botón de hamburguesa (MobileNav).
 * Los enlaces salen de `siteConfig.nav`.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-cream/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <BrandLogo />

        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {siteConfig.nav.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-brand-50 hover:text-brand-700"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <ContactWhatsAppButton size="sm" label="WhatsApp" />
          </div>
          <MobileNav links={siteConfig.nav}>
            <ContactWhatsAppButton fullWidth />
          </MobileNav>
        </div>
      </Container>
    </header>
  );
}
