import { getProducts } from "@/services/catalog-service";

import { ButtonLink } from "../ui/button";
import { Container } from "../ui/container";
import { SectionHeading } from "../ui/section-heading";
import { Skeleton } from "../ui/skeleton";
import { ProductGrid } from "./product-grid";
import { ProductGridSkeleton } from "./product-grid-skeleton";

interface ProductShowcaseProps {
  /** Cuántos productos mostrar (la API devuelve todos; aquí se toman los primeros). */
  limit?: number;
}

/**
 * Sección de productos destacados de la portada (async: pide los datos a la API).
 * Debe usarse dentro de <Suspense> con `ProductShowcaseSkeleton` como respaldo.
 */
export async function ProductShowcase({ limit = 8 }: ProductShowcaseProps) {
  const products = await getProducts();
  if (products.length === 0) return null;

  return (
    <section className="py-12 sm:py-16">
      <Container>
        <SectionHeading
          eyebrow="Nuestra tienda"
          title="Regalos para sorprender"
          description="Algunos de nuestros detalles favoritos. Pídelos por WhatsApp en un momento."
          action={
            <ButtonLink href="/productos" variant="secondary">
              Ver toda la tienda
            </ButtonLink>
          }
        />
        <div className="mt-8">
          <ProductGrid products={products.slice(0, limit)} />
        </div>
      </Container>
    </section>
  );
}

/** Esqueleto de carga de `ProductShowcase`. */
export function ProductShowcaseSkeleton() {
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <Skeleton className="h-8 w-72" />
        <div className="mt-8">
          <ProductGridSkeleton count={8} />
        </div>
      </Container>
    </section>
  );
}
