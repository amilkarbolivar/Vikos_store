import { notFound } from "next/navigation";

import { getCategories, getCategory, getProducts } from "@/services/catalog-service";

import { CatalogBrowser } from "../catalog/catalog-browser";

interface CategoryContentProps {
  /**
   * Los parámetros de la URL llegan como una PROMESA y se esperan AQUÍ, dentro del bloque
   * que va en <Suspense>. (Con Cache Components, leer `params` es un dato "de petición":
   * si se esperara en la página misma, esta no podría prerenderizarse.)
   */
  paramsPromise: Promise<{ slug: string }>;
}

/** Carga los datos de /categorias/<slug>: la categoría y solo sus productos. */
export async function CategoryContent({ paramsPromise }: CategoryContentProps) {
  const { slug } = await paramsPromise;

  // Primero la categoría: si no existe (o está desactivada) mostramos la página 404.
  const category = await getCategory(slug);
  if (!category) notFound();

  const [categories, products] = await Promise.all([getCategories(), getProducts(category.id)]);

  return <CatalogBrowser categories={categories} products={products} activeCategory={category} />;
}
