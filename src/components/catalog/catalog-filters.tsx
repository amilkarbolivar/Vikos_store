import { siteConfig } from "@/config/site";
import { priceRangeKey, priceRangeLabel } from "@/lib/catalog-filters";
import type { Category } from "@/types/catalog";

import { Button, ButtonLink } from "../ui/button";
import { Select } from "../ui/select";

interface CatalogFiltersProps {
  categories: Category[];
  /** Slug de la categoría seleccionada (si hay una). */
  selectedCategorySlug?: string;
  /** Clave del rango de precio seleccionado (si hay uno). Ver `priceRangeKey`. */
  selectedPriceKey?: string;
}

/**
 * Barra de filtros de la tienda: selector de CATEGORÍA + selector de PRECIO.
 *
 * Funciona sin JavaScript: es un formulario normal con método GET. Al pulsar "Filtrar" el
 * navegador va a  /productos?categoria=<slug>&precio=<rango>  y el SERVIDOR dibuja la
 * página ya filtrada. Ventajas: cada filtro tiene su propia URL (se puede compartir y
 * guardar), el botón "atrás" funciona, y no hay estado que mantener en el navegador.
 *
 * Las opciones de precio salen de `siteConfig.priceRanges`.
 * `defaultValue` deja marcada la opción que el visitante eligió la vez anterior.
 */
export function CatalogFilters({ categories, selectedCategorySlug, selectedPriceKey }: CatalogFiltersProps) {
  const hasFilters = Boolean(selectedCategorySlug || selectedPriceKey);

  return (
    <form
      action="/productos"
      method="get"
      aria-label="Filtrar regalos"
      className="grid gap-3 rounded-card border border-line bg-white p-4 shadow-card sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] lg:items-end"
    >
      <Select label="Categoría" name="categoria" defaultValue={selectedCategorySlug ?? ""}>
        <option value="">Todas las categorías</option>
        {categories.map((category) => (
          <option key={category.id} value={category.slug}>
            {category.name}
          </option>
        ))}
      </Select>

      <Select label="Precio" name="precio" defaultValue={selectedPriceKey ?? ""}>
        <option value="">Todos los precios</option>
        {siteConfig.priceRanges.map((range) => (
          <option key={priceRangeKey(range)} value={priceRangeKey(range)}>
            {priceRangeLabel(range)}
          </option>
        ))}
      </Select>

      <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-1">
        <Button type="submit" className="flex-1 lg:flex-none">
          Filtrar
        </Button>
        {/* "Limpiar" solo aparece si hay algún filtro aplicado. */}
        {hasFilters && (
          <ButtonLink href="/productos" variant="ghost">
            Limpiar
          </ButtonLink>
        )}
      </div>
    </form>
  );
}
