import type { Metadata } from "next";
import { Suspense } from "react";

import { CatalogBrowserSkeleton } from "@/components/catalog/catalog-browser";
import { CategoryContent } from "@/components/page-content/category-content";
import { truncate } from "@/lib/truncate";
import { getCategory } from "@/services/catalog-service";

type Props = { params: Promise<{ slug: string }> };

/**
 * Título de la pestaña según la categoría. `getCategory` está envuelta en `cache()`,
 * así que si la página pide la misma categoría, la API se consulta una sola vez.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) return { title: "Categoría no encontrada" };

  return {
    title: category.name,
    description: truncate(category.description ?? `Regalos de la categoría ${category.name}.`),
  };
}

/** CATEGORÍA ( /categorias/<slug> ): los productos de una sola categoría. */
export default function CategoryPage({ params }: Props) {
  return (
    <Suspense fallback={<CatalogBrowserSkeleton />}>
      {/* Se pasa la PROMESA de `params` (sin esperarla aquí): ver CategoryContent. */}
      <CategoryContent paramsPromise={params} />
    </Suspense>
  );
}
