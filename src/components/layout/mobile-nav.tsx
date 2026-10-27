"use client";

/**
 * ============================================================================
 * MENÚ MÓVIL (único componente de cliente del sitio)
 * ============================================================================
 * Necesita JavaScript en el navegador porque tiene ESTADO (abierto / cerrado), por eso
 * lleva "use client". Todo lo demás de la tienda se renderiza en el servidor.
 *
 * Los elementos del menú (enlaces fijos, categorías y botón de WhatsApp) llegan desde el
 * servidor como `children`: así este componente no sabe nada de la API ni de la
 * configuración, y no se envía al navegador más código del necesario.
 */
import { useState, type MouseEvent, type ReactNode } from "react";

import { CloseIcon, MenuIcon } from "../ui/icons";

interface MobileNavProps {
  /** Elementos <li> del menú. */
  children: ReactNode;
}

export function MobileNav({ children }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  /**
   * Al navegar, el layout NO se vuelve a montar, así que el menú seguiría abierto.
   * En lugar de poner un `onClick` en cada enlace (los enlaces vienen del servidor y no
   * pueden llevar funciones), se escucha UNA vez en todo el menú: si el clic fue sobre un
   * enlace (o dentro de uno), se cierra.
   */
  const closeOnLinkClick = (event: MouseEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest("a")) close();
  };

  return (
    // Escape cierra el menú (comportamiento esperado por quien navega con teclado).
    <div onKeyDown={(event) => event.key === "Escape" && close()}>
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
          onClick={closeOnLinkClick}
          className="absolute inset-x-0 top-full max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-line bg-cream shadow-card"
        >
          <ul className="mx-auto max-w-7xl space-y-1 px-4 py-3">{children}</ul>
        </nav>
      )}
    </div>
  );
}
