import Link from "next/link";
import { Suspense, type ReactNode } from "react";

import { adminConfig } from "@/config/admin";
import { siteConfig } from "@/config/site";
import { ButtonLink } from "@/components/ui/button";
import { GiftIcon } from "@/components/ui/icons";

import { ExternalLinkIcon } from "../admin-icons";
import { AdminNav } from "./admin-nav";
import { AdminNavList } from "./admin-nav-list";
import { AdminUser } from "./admin-user";
import { LogoutButton } from "./logout-button";

/**
 * MARCO DEL PANEL DE ADMINISTRACIÓN
 *
 *   Escritorio: barra lateral fija a la izquierda + contenido a la derecha.
 *   Celular:    barra superior (marca + acciones + navegación deslizable) y el contenido debajo.
 *
 * Es independiente del marco de la tienda (`StoreShell`): el panel no muestra el encabezado,
 * el pie ni el botón de WhatsApp de la tienda.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const viewStore = (
    // El texto se oculta en celular (solo icono) para que quepa el nombre de la marca; el
    // `aria-label` conserva el nombre accesible completo.
    <ButtonLink href="/" variant="ghost" size="sm" target="_blank" rel="noopener noreferrer" aria-label="Ver tienda (se abre en otra pestaña)">
      <ExternalLinkIcon />
      <span className="hidden sm:inline">Ver tienda</span>
    </ButtonLink>
  );

  return (
    <div className="min-h-dvh bg-cream lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="border-b border-line bg-white lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-3 px-4 pt-3 lg:px-5 lg:pt-6">
          <Link href="/admin" className="flex min-w-0 items-center gap-2.5" aria-label={`${adminConfig.title}, ir al resumen`}>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-xl text-white">
              <GiftIcon />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-base font-extrabold tracking-tight text-ink">{siteConfig.name}</span>
              <span className="block truncate text-xs font-semibold text-muted">Panel</span>
            </span>
          </Link>

          {/* En celular las acciones van arriba, junto a la marca. */}
          <div className="flex items-center lg:hidden">
            {viewStore}
            <LogoutButton />
          </div>
        </div>

        <div className="px-4 py-3 lg:flex-1 lg:px-3 lg:py-6">
          <Suspense fallback={<AdminNavList pathname={null} />}>
            <AdminNav />
          </Suspense>
        </div>

        {/* En escritorio las acciones van al pie de la barra lateral. */}
        <div className="hidden space-y-2 border-t border-line p-4 lg:block">
          <Suspense fallback={<p className="text-xs text-muted">Comprobando sesión…</p>}>
            <AdminUser />
          </Suspense>
          <div className="-ml-3 flex flex-col items-start">
            {viewStore}
            <LogoutButton />
          </div>
        </div>
      </aside>

      <main className="min-w-0 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
    </div>
  );
}
