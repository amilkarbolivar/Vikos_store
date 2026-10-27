import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * Común a TODO /admin (login y panel). Los motores de búsqueda NO deben indexar el panel
 * (`robots: noindex`): no tiene nada que hacer en Google.
 */
export const metadata: Metadata = {
  title: { default: "Panel de administración", template: "%s | Panel" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
