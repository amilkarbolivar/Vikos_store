import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

/**
 * ============================================================================
 * CAMPOS DE FORMULARIO
 * ============================================================================
 * Input, Textarea y NativeSelect comparten el MISMO aspecto (`controlStyles`), así todos los
 * formularios del panel se ven iguales. Se usan junto a `FormField` (etiqueta + error).
 *
 * Los tres aceptan `invalid`: pinta el borde en rojo y marca el campo con `aria-invalid`
 * para que los lectores de pantalla anuncien el error.
 */

/** Clases comunes de todos los controles. */
const controlStyles =
  "w-full rounded-xl border bg-white px-4 text-sm text-ink placeholder:text-muted/70 " +
  "transition-colors hover:border-brand-500 disabled:cursor-not-allowed disabled:bg-cream disabled:opacity-70";

function borderFor(invalid?: boolean): string {
  return invalid ? "border-red-600" : "border-line";
}

interface InvalidProp {
  /** `true` si el campo tiene un error: borde rojo y `aria-invalid`. */
  invalid?: boolean;
}

export function Input({ invalid, className, ...props }: InputHTMLAttributes<HTMLInputElement> & InvalidProp) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cn(controlStyles, "min-h-11", borderFor(invalid), className)}
      {...props}
    />
  );
}

export function Textarea({ invalid, className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & InvalidProp) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={cn(controlStyles, "min-h-28 py-3", borderFor(invalid), className)}
      {...props}
    />
  );
}

/** Desplegable NATIVO del navegador (en celular abre el selector del sistema). */
export function NativeSelect({ invalid, className, ...props }: SelectHTMLAttributes<HTMLSelectElement> & InvalidProp) {
  return (
    <select
      aria-invalid={invalid || undefined}
      className={cn(controlStyles, "min-h-11 font-medium", borderFor(invalid), className)}
      {...props}
    />
  );
}
