import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

/** Aspecto común de las acciones pequeñas de una fila (Editar, Ocultar, Eliminar...). */
const styles =
  "inline-flex min-h-9 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-xs font-semibold " +
  "text-ink transition-colors hover:bg-brand-50 hover:text-brand-700 disabled:pointer-events-none disabled:opacity-50";

interface Props {
  children: ReactNode;
  /** Texto completo para lectores de pantalla (por ejemplo "Editar Oso grande"). */
  label: string;
  danger?: boolean;
}

/** Acción de fila que ejecuta algo (un <button>). */
export function RowButton({ children, label, danger, className, ...props }: Props & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(styles, danger && "text-red-700 hover:bg-red-50 hover:text-red-800", className)}
      {...props}
    >
      {children}
    </button>
  );
}

/** Acción de fila que navega a otra página (un enlace). */
export function RowLink({ children, label, href }: Props & { href: string }) {
  return (
    <Link href={href} aria-label={label} className={styles}>
      {children}
    </Link>
  );
}
