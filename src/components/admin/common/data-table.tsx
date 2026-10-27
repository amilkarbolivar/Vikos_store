import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

/**
 * Tabla del panel. En pantallas estrechas se desliza horizontalmente en lugar de romper la
 * página. `caption` describe la tabla para lectores de pantalla (no se ve).
 */
export function DataTable({ caption, children, className }: { caption: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-x-auto rounded-card border border-line bg-white shadow-card", className)}>
      {/* `[&_tbody_tr:last-child_td]:border-b-0`: quita el borde inferior solo de la ÚLTIMA FILA. */}
      <table className="w-full min-w-[40rem] border-collapse text-left text-sm [&_tbody_tr:last-child_td]:border-b-0">
        <caption className="sr-only">{caption}</caption>
        {children}
      </table>
    </div>
  );
}

export function Th({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={cn("border-b border-line bg-cream/60 px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted", className)}
      {...props}
    />
  );
}

export function Td({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("border-b border-line px-4 py-3 align-middle", className)} {...props} />;
}
