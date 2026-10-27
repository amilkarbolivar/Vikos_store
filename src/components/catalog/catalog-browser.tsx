import { priceRangeKey, priceRangeLabel, type PriceRange } from "@/lib/catalog-filters";
import type { Category, Product } from "@/types/catalog";

import { ButtonLink } from "../ui/button";
import { Container } from "../ui/container";
import { EmptyState } from "../ui/empty-state";
import { SectionHeading } from "../ui/section-heading";
import { Skeleton } from "../ui/skeleton";
import { CatalogFilters } from "./catalog-filters";
import { ProductGrid } from "./product-grid";
import { ProductGridSkeleton } from "./product-grid-skeleton";

interface CatalogBrowserProps {
  /** Todas las categorías (para el selector de categoría). */
  categories: Category[];
  /** Los productos ya filtrados que se van a mostrar. */
  products: Product[];
  /** Categoría seleccionada; `undefined` = se está viendo toda la tienda. */
  activeCategory?: Category;
  /** Rango de precio seleccionado; `undefined` = todos los precios. */
  selectedPrice?: PriceRange;
}

/**
 * Vista de catálogo: título + filtros (categoría y precio) + contador + cuadrícula.
 *
 * Es PRESENTACIONAL: no pide datos, solo dibuja lo que recibe. Por eso sirve igual para
 * "toda la tienda" (/productos) y para una categoría (/categorias/<slug>): lo único que
 * cambia es qué `products`, `activeCategory` y `selectedPrice` se le pasan.
 */
export function CatalogBrowser({ categories, products, activeCategory, selectedPrice }: CatalogBrowserProps) {
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
        <CatalogFilters
          categories={categories}
          selectedCategorySlug={activeCategory?.slug}
          selectedPriceKey={selectedPrice ? priceRangeKey(selectedPrice) : undefined}
        />
      </div>

      {/* `aria-live`: al filtrar, el lector de pantalla anuncia el nuevo total. */}
      <p className="mt-6 text-sm text-muted" aria-live="polite">
        {count} {count === 1 ? "regalo" : "regalos"}
        {selectedPrice && ` · ${priceRangeLabel(selectedPrice)}`}
      </p>

      <div className="mt-4">
        <ProductGrid
          products={products}
          // Si el visitante filtró por precio, "no hay nada" significa "no hay nada en ese rango".
          emptyState={
            selectedPrice ? (
              <EmptyState
                title="No hay regalos en ese rango de precio"
                description="Prueba con otro rango o quita el filtro para ver todos los regalos."
                action={
                  <ButtonLink href={activeCategory ? `/productos?categoria=${activeCategory.slug}` : "/productos"} variant="secondary">
                    Quitar filtro de precio
                  </ButtonLink>
                }
              />
            ) : undefined
          }
        />
      </div>
    </Container>
  );
}

/** Esqueleto de carga de `CatalogBrowser` (título, filtros y cuadrícula). */
export function CatalogBrowserSkeleton() {
  return (
    <Container className="py-8 sm:py-12">
      <Skeleton className="h-10 w-72" />
      <Skeleton className="mt-3 h-5 w-96 max-w-full" />
      <Skeleton className="mt-6 h-24 w-full rounded-card" />
      <div className="mt-10">
        <ProductGridSkeleton count={8} />
      </div>
    </Container>
  );
}
