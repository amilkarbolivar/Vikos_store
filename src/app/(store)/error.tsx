"use client";

import { Button, ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";

/**
 * Pantalla de error inesperado (por ejemplo, la API no responde).
 *
 * Next.js exige que sea un componente de cliente. Recibe `retry`, que vuelve a intentar
 * renderizar la página. A propósito NO se muestra el mensaje técnico del error al
 * visitante (podría revelar detalles internos); solo un texto amable.
 */
export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <Container className="py-16 sm:py-24">
      <EmptyState
        title="Algo salió mal"
        description="No pudimos cargar esta página. Inténtalo de nuevo en unos segundos."
        action={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={() => retry()}>Reintentar</Button>
            <ButtonLink href="/" variant="secondary">
              Ir al inicio
            </ButtonLink>
          </div>
        }
      />
    </Container>
  );
}
