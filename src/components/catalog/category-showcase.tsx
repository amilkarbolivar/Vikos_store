import { getCategories } from "@/services/catalog-service";

import { Container } from "../ui/container";
import { SectionHeading } from "../ui/section-heading";
import { Skeleton } from "../ui/skeleton";
import { CategoryCard } from "./category-card";

/**
 * Sección de categorías de la portada.
 *
 * Es un componente ASYNC de servidor: pide los datos a la API él mismo. Por eso la página
 * que lo usa debe envolverlo en <Suspense> (ver app/page.tsx) y darle `CategoryShowcaseSkeleton`
 * como "plan B" mientras llegan los datos.
 *
 * Si no hay categorías, no pinta nada (ni siquiera el título).
 */
export async function CategoryShowcase() {
  const categories = await getCategories();
  if (categories.length === 0) return null;

  return (
    <section className="py-12 sm:py-16">
      <Container>
        <SectionHeading
          eyebrow="Explora"
          title="Encuentra el regalo ideal"
          description="Elige una categoría y descubre detalles para cada ocasión."
        />
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((category, index) => (
            <li key={category.id}>
              <CategoryCard category={category} index={index} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/** Esqueleto de carga de `CategoryShowcase`. */
export function CategoryShowcaseSkeleton() {
  return (
    <section className="py-12 sm:py-16" aria-hidden="true">
      <Container>
        <Skeleton className="h-8 w-64" />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-48 rounded-card" />
          ))}
        </div>
      </Container>
    </section>
  );
}
