"use client";

import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

/**
 * Error inesperado dentro del panel (por ejemplo, la API no responde). Se dibuja dentro del
 * marco del panel. No se muestra el mensaje técnico: solo un texto amable.
 */
export default function AdminError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <EmptyState
      title="No pudimos cargar esta página"
      description="Ocurrió un problema al leer los datos. Inténtalo de nuevo en unos segundos."
      action={
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={() => retry()}>Reintentar</Button>
          <ButtonLink href="/admin" variant="secondary">
            Ir al resumen
          </ButtonLink>
        </div>
      }
    />
  );
}
