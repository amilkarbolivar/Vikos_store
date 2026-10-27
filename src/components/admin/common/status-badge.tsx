import { cn } from "@/lib/cn";

interface StatusBadgeProps {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}

/**
 * Etiqueta de estado (verde = activo, gris = inactivo). El estado se dice con TEXTO y no solo
 * con el color, para que lo entienda quien no distingue colores o usa lector de pantalla.
 */
export function StatusBadge({ active, activeLabel = "Activa", inactiveLabel = "Desactivada" }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold",
        active ? "bg-green-100 text-green-800" : "bg-stone-200 text-stone-700",
      )}
    >
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", active ? "bg-green-600" : "bg-stone-500")} />
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}
