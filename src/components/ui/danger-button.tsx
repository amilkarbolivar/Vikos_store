import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

/**
 * Botón rojo para acciones destructivas e irreversibles (por ejemplo, eliminar un producto).
 * Es un componente aparte, y no una variante de `Button`, para no mezclar clases de color en
 * conflicto. Mismas medidas que `Button` (≥ 44px de alto: fácil de tocar).
 */
export function DangerButton({ className, type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-red-700 px-5 text-sm font-semibold text-white",
        "transition-colors hover:bg-red-800 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
