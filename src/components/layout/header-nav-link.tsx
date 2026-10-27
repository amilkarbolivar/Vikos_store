import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

interface HeaderNavLinkProps {
  href: string;
  children: ReactNode;
  /** Texto completo, por si el nombre se recorta con "…" por falta de espacio. */
  title?: string;
  /** `desktop` = enlace del encabezado; `mobile` = fila del menú desplegable. */
  variant?: "desktop" | "mobile";
  /**
   * `true` para textos de largo imprevisible (los nombres de categoría vienen de la API):
   * si falta espacio, ESTE enlace se recorta con "…". Los enlaces fijos (Inicio, Sobre
   * nosotros, Tienda) nunca se recortan: conservan su ancho y ceden el espacio a los demás.
   */
  truncatable?: boolean;
}

/**
 * Un enlace del menú principal, en forma de <li>. Lo usan TANTO los enlaces fijos
 * (Inicio, Sobre nosotros, Tienda) como los de categorías, para que todos se vean igual y
 * el estilo se defina en un solo lugar.
 */
export function HeaderNavLink({ href, children, title, variant = "desktop", truncatable = false }: HeaderNavLinkProps) {
  return (
    // `shrink-0` = no se encoge; `min-w-0` = puede encogerse por debajo de su contenido (necesario
    // para que `truncate` funcione dentro de un contenedor flex).
    <li className={variant === "desktop" ? (truncatable ? "min-w-0" : "shrink-0") : undefined}>
      <Link
        href={href}
        title={title}
        className={cn(
          "transition-colors hover:bg-brand-50 hover:text-brand-700",
          variant === "desktop"
            ? cn(
                "block rounded-full px-3 py-2 text-sm font-semibold text-ink",
                // Solo las categorías se recortan con "…" si falta espacio (ver `truncatable`).
                truncatable && "max-w-[16rem] truncate",
              )
            : "block rounded-lg px-3 py-3 font-semibold text-ink",
        )}
      >
        {children}
      </Link>
    </li>
  );
}
