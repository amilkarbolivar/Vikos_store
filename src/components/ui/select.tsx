import type { ReactNode, SelectHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> {
  /** Texto de la etiqueta que se muestra sobre el selector. */
  label: string;
  /** `name` es obligatorio: es el nombre del parámetro que viaja en la URL y, además, base del `id`. */
  name: string;
  /** Las <option> del selector. */
  children: ReactNode;
}

/**
 * Selector desplegable con su etiqueta, ya estilizado.
 *
 * - La <label> está asociada al <select> (htmlFor/id): al tocar la etiqueta se enfoca el
 *   selector y los lectores de pantalla anuncian para qué sirve.
 * - Usa el desplegable NATIVO del navegador a propósito: en celular abre el selector del
 *   sistema (cómodo de usar) y funciona sin JavaScript.
 */
export function Select({ label, name, className, children, ...props }: SelectProps) {
  const id = `filtro-${name}`;

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-bold uppercase tracking-wider text-muted">
        {label}
      </label>
      <select
        id={id}
        name={name}
        className={cn(
          "min-h-11 w-full rounded-full border border-line bg-white px-4 text-sm font-semibold text-ink",
          "transition-colors hover:border-brand-500",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
