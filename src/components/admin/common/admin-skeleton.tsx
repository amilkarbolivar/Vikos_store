import { Skeleton } from "@/components/ui/skeleton";

/** Esqueleto de carga de las páginas del panel: título + una tabla con filas. */
export function AdminPageSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Cargando">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="mt-3 h-4 w-80 max-w-full" />
      <div className="mt-8 space-y-3">
        {Array.from({ length: rows }, (_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-card" />
        ))}
      </div>
    </div>
  );
}
