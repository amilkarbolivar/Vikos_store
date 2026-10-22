import type { Category, Product } from "@/types/catalog";

import { Container } from "../ui/container";
import { SectionHeading } from "../ui/section-heading";
import { Skeleton } from "../ui/skeleton";
import { CategoryChips } from "./category-chips";
import { ProductGrid } from "./product-grid";
import { ProductGridSkeleton } from "./product-grid-skeleton";

interface CatalogBrowserProps {
  /** Todas las categorías (para las píldoras de filtro). */
  categories: Category[];
  /** Los productos ya filtrados que se van a mostrar. */
  products: Product[];
  /** Categoría seleccionada; `undefined` = se está viendo toda la tienda. */
  activeCategory?: Category;
}

/**
 * Vista de catálogo: título + filtro por categoría + contador + cuadrícula.
 *
 * Es PRESENTACIONAL: no pide datos, solo dibuja lo que recibe. Por eso sirve igual para
 * "toda la tienda" (/productos) y para una categoría (/categorias/<slug>): lo único que
 * cambia es qué `products` y `activeCategory` se le pasan.
 */
export function CatalogBrowser({ categories, products, activeCategory }: CatalogBrowserProps) {
  const count = products.length;

  return (
    <Container className="py-8 sm:py-12">
      <SectionHeading
        level={1}
        eyebrow="Tienda"
        title={activeCategory?.name ?? "Todos los regalos"}
        description={activeCategory?.description ?? "Elige tu regalo favorito y pídelo por WhatsApp."}
      />

      <div className="mt-6">
        <CategoryChips categories={categories} activeSlug={activeCategory?.slug} />
      </div>

      {/* `aria-live`: al cambiar de filtro, el lector de pantalla anuncia el nuevo total. */}
      <p className="mt-6 text-sm text-muted" aria-live="polite">
        {count} {count === 1 ? "regalo" : "regalos"}
      </p>

      <div className="mt-4">
        <ProductGrid products={products} />
      </div>
    </Container>
  );
}

/** Esqueleto de carga de `CatalogBrowser` (título, píldoras y cuadrícula). */
export function CatalogBrowserSkeleton() {
  return (
    <Container className="py-8 sm:py-12">
      <Skeleton className="h-10 w-72" />
      <Skeleton className="mt-3 h-5 w-96 max-w-full" />
      <div className="mt-6 flex gap-2">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-10 w-24 rounded-full" />
        ))}
      </div>
      <div className="mt-10">
        <ProductGridSkeleton count={8} />
      </div>
    </Container>
  );
}
