import type { ReactNode } from "react";

import { WhatsAppFloat } from "../whatsapp/whatsapp-float";
import { AnnouncementBar } from "./announcement-bar";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

/**
 * MARCO DE LA TIENDA PÚBLICA:
 *
 *   franja de aviso → encabezado → [contenido de la página] → pie → botón flotante de WhatsApp
 *
 * Antes vivía en el layout raíz; ahora está aquí para que el PANEL DE ADMINISTRACIÓN (que
 * tiene su propio marco) no muestre el encabezado ni el pie de la tienda. Lo usan el layout
 * del grupo `(store)` y la página 404 global.
 *
 * Nada de aquí depende de la API para el HTML inicial, así que el marco carga al instante.
 */
export function StoreShell({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Enlace invisible que aparece al navegar con Tab: salta directo al contenido. */}
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:shadow-card-hover"
      >
        Saltar al contenido
      </a>

      <AnnouncementBar />
      <SiteHeader />

      <main id="contenido" className="flex-1">
        {children}
      </main>

      <SiteFooter />
      <WhatsAppFloat />
    </>
  );
}
