import Link from "next/link";

import { siteConfig } from "@/config/site";

import { Container } from "../ui/container";
import { ContactWhatsAppButton } from "../whatsapp/contact-whatsapp-button";
import { BrandLogo } from "./brand-logo";

/**
 * Pie de página: marca, enlaces y contacto.
 *
 * Nota: el año del copyright no se calcula con `new Date()` a propósito. Con Cache Components,
 * leer la hora actual en un componente estático rompe el prerenderizado; un texto fijo no.
 */
export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line bg-white">
      <Container className="grid gap-10 py-12 md:grid-cols-3">
        <div className="space-y-3">
          <BrandLogo />
          <p className="max-w-xs text-sm text-muted">{siteConfig.description}</p>
        </div>

        <nav aria-label="Pie de página">
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink">Navegación</h2>
          <ul className="mt-3 space-y-2">
            {siteConfig.nav.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-muted hover:text-brand-700 hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink">¿Hablamos?</h2>
          <p className="mt-3 text-sm text-muted">
            Cuéntanos qué quieres regalar y te ayudamos a elegir.
          </p>
          <div className="mt-4">
            <ContactWhatsAppButton />
          </div>
        </div>
      </Container>

      <div className="border-t border-line py-5 text-center text-xs text-muted">
        © {siteConfig.name}. Todos los derechos reservados.
      </div>
    </footer>
  );
}
