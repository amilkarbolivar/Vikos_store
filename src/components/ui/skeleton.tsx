import { cn } from "@/lib/cn";

/**
 * Bloque gris que "late" mientras llegan los datos de la API.
 * Se combina para formar esqueletos de carga (ver `ProductGridSkeleton`).
 * `aria-hidden`: los lectores de pantalla no deben leer cajas vacías.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-lg bg-brand-100/60", className)} />;
}
