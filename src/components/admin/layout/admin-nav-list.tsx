import Link from "next/link";

import { adminConfig } from "@/config/admin";
import { cn } from "@/lib/cn";

import { GridIcon, PackageIcon, TagIcon } from "../admin-icons";

const icons = {
  "/admin": GridIcon,
  "/admin/productos": PackageIcon,
  "/admin/categorias": TagIcon,
} as const;

/** ¿El enlace corresponde a la página actual? (`exact`: igual; `prefix`: igual o una subpágina). */
function isActive(pathname: string | null, href: string, match: "exact" | "prefix"): boolean {
  if (pathname === null) return false;
  return match === "exact" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Lista de enlaces del panel (Resumen, Productos, Categorías). Es PRESENTACIONAL: recibe la
 * ruta actual y resalta el enlace que corresponde. Con `pathname={null}` no resalta ninguno
 * (así se ve mientras carga `AdminNav`).
 *
 * Celular: fila horizontal deslizable. Escritorio: columna vertical.
 */
export function AdminNavList({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="Panel de administración">
      <ul className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
        {adminConfig.nav.map((item) => {
          const active = isActive(pathname, item.href, item.match);
          const Icon = icons[item.href as keyof typeof icons];

          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                // `aria-current` le dice al lector de pantalla cuál es la página actual.
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-2.5 rounded-xl px-3.5 text-sm font-semibold transition-colors",
                  active ? "bg-brand-600 text-white" : "text-ink hover:bg-brand-50 hover:text-brand-700",
                )}
              >
                <Icon />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
