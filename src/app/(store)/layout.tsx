import type { ReactNode } from "react";

import { StoreShell } from "@/components/layout/store-shell";

/** Marco de la tienda pública: todas las páginas de este grupo lo comparten. */
export default function StoreLayout({ children }: { children: ReactNode }) {
  return <StoreShell>{children}</StoreShell>;
}
