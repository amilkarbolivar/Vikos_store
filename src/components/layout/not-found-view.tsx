import { ButtonLink } from "../ui/button";
import { Container } from "../ui/container";
import { EmptyState } from "../ui/empty-state";

/**
 * Contenido de la pantalla 404 de la TIENDA. Se usa dentro del marco de la tienda, tanto
 * cuando una página llama a `notFound()` como cuando la URL no existe.
 */
export function NotFoundView() {
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
