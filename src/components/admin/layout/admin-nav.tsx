"use client";

import { usePathname } from "next/navigation";

import { AdminNavList } from "./admin-nav-list";

/**
 * Navegación del panel CON el enlace de la página actual resaltado.
 *
 * Necesita conocer la ruta actual (`usePathname`), que solo existe en el navegador: por eso es
 * un componente de cliente. Como las rutas del panel incluyen partes dinámicas
 * (/admin/productos/[id]), Next.js exige envolverlo en <Suspense>; mientras tanto se muestra
 * `AdminNavList` sin resaltado (ver `AdminShell`).
 */
export function AdminNav() {
  return <AdminNavList pathname={usePathname()} />;
}
