import { siteConfig } from "@/config/site";
import { filterByPrice, findPriceRange, firstParam } from "@/lib/catalog-filters";
import { getCategories, getProducts } from "@/services/catalog-service";

import { CatalogBrowser } from "../catalog/catalog-browser";

interface AllProductsContentProps {
  /**
   * Los parámetros de la URL (?categoria=...&precio=...) llegan como una PROMESA y se esperan
   * AQUÍ, dentro del bloque que va en <Suspense>. (Con Cache Components, leer `searchParams`
   * es un dato "de petición": si se esperara en la página misma, esta no podría prerenderizarse.)
   */
  searchParamsPromise: Promise<{ categoria?: string | string[]; precio?: string | string[] }>;
}

/**
 * Carga los datos de /productos y aplica los filtros que eligió el visitante.
 *
 *  - Categoría: la API filtra por `categoryId`, así que primero se traduce el slug de la URL
 *    a su id usando la lista de categorías. Un slug desconocido se ignora (se muestra todo)
 *    para que un enlace viejo no rompa la página.
 *  - Precio: la API no filtra por precio, así que se aplica aquí sobre la lista recibida.
 *    Es adecuado para un catálogo pequeño o mediano; con miles de productos convendría
 *    mover este filtro a la API.
 */
export async function AllProductsContent({ searchParamsPromise }: AllProductsContentProps) {
  const params = await searchParamsPromise;
  const categorySlug = firstParam(params.categoria);

  const categoriesPromise = getCategories();
  const activeCategory = categorySlug
    ? (await categoriesPromise).find((category) => category.slug === categorySlug)
    : undefined;

  // La lista de productos y la de categorías se piden a la vez (la de categorías ya está en curso).
  const [categories, categoryProducts] = await Promise.all([
    categoriesPromise,
    getProducts(activeCategory?.id),
  ]);

  const selectedPrice = findPriceRange(firstParam(params.precio), siteConfig.priceRanges);

  return (
    <CatalogBrowser
      categories={categories}
      products={filterByPrice(categoryProducts, selectedPrice)}
      activeCategory={activeCategory}
      selectedPrice={selectedPrice}
    />
  );
}
