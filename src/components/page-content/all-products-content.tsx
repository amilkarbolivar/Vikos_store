import { getCategories, getProducts } from "@/services/catalog-service";

import { CatalogBrowser } from "../catalog/catalog-browser";

/**
 * Carga los datos de /productos (toda la tienda) y los entrega a la vista.
 * Las dos peticiones (categorías y productos) se hacen A LA VEZ con Promise.all:
 * tardan lo que tarde la más lenta, no la suma de ambas.
 */
export async function AllProductsContent() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  return <CatalogBrowser categories={categories} products={products} />;
}
