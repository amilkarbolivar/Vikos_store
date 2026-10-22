"use client";

/**
 * ============================================================================
 * MENÚ MÓVIL (único componente de cliente del sitio)
 * ============================================================================
 * Necesita JavaScript en el navegador porque tiene ESTADO (abierto / cerrado), por eso
 * lleva "use client". Todo lo demás de la tienda se renderiza en el servidor.
 *
 * Para no meter más código del necesario al navegador, el contenido que NO depende del
 * estado (el botón de WhatsApp) llega desde el servidor como `children`.
 */
import Link from "next/link";
import { useState, type ReactNode } from "react";

import { CloseIcon, MenuIcon } from "../ui/icons";

interface MobileNavProps {
  links: ReadonlyArray<{ label: string; href: string }>;
  /** Contenido extra al final del menú (renderizado en el servidor). */
  children?: ReactNode;
}

export function MobileNav({ links, children }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    // Escape cierra el menú (comportamiento esperado por quien navega con teclado).
    <div className="md:hidden" onKeyDown={(event) => event.key === "Escape" && close()}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="menu-movil"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        className="flex size-11 items-center justify-center rounded-full text-2xl text-ink hover:bg-brand-50"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      {open && (
        // `absolute top-full`: el panel cuelga justo debajo del encabezado (que es `sticky`).
        <nav
          id="menu-movil"
          aria-label="Menú móvil"
          className="absolute inset-x-0 top-full border-b border-line bg-cream shadow-card"
        >
          <ul className="mx-auto max-w-7xl space-y-1 px-4 py-3">
            {links.map((link) => (
              <li key={link.href}>
                {/* Al navegar, el layout NO se vuelve a montar: hay que cerrar el menú a mano. */}
                <Link
                  href={link.href}
                  onClick={close}
                  className="block rounded-lg px-3 py-3 font-semibold text-ink hover:bg-brand-50"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {children && <li className="pt-2">{children}</li>}
          </ul>
        </nav>
      )}
    </div>
  );
}
