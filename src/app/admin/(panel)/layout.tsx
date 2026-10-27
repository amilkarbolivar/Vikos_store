import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/layout/admin-shell";

/**
 * Marco del panel (barra lateral). Está en el grupo `(panel)` para que el LOGIN, que vive en
 * /admin/login fuera del grupo, se muestre sin barra lateral. Las URLs no cambian.
 */
export default function PanelLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
