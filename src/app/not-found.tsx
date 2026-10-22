import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

/**
 * Pantalla 404. Next.js la muestra cuando una ruta no existe o cuando una página llama a
 * `notFound()` (por ejemplo, un producto que no existe o está oculto).
 */
export default function NotFound() {
  return (
    <Container className="py-16 sm:py-24">
      <EmptyState
        title="No encontramos lo que buscas"
        description="Puede que el enlace esté mal escrito o que este regalo ya no esté disponible."
        action={<ButtonLink href="/productos">Ver la tienda</ButtonLink>}
      />
    </Container>
  );
}
