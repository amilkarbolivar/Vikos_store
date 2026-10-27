import type { Metadata } from "next";
import { Suspense } from "react";

import { CatalogBrowserSkeleton } from "@/components/catalog/catalog-browser";
import { AllProductsContent } from "@/components/page-content/all-products-content";

/** Título y descripción de la pestaña / Google. El título final es "Tienda | Vikos Store". */
export const metadata: Metadata = {
  title: "Tienda",
  description: "Explora todos nuestros regalos y pídelos por WhatsApp.",
};

type Props = {
  searchParams: Promise<{ categoria?: string | string[]; precio?: string | string[] }>;
};

/**
 * TIENDA ( /productos ): todos los productos visibles, con selector de categoría y de precio.
 * Los filtros viajan en la URL: /productos?categoria=peluches&precio=0-50000
 */
export default function ProductsPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<CatalogBrowserSkeleton />}>
      {/* Se pasa la PROMESA de `searchParams` (sin esperarla aquí): ver AllProductsContent. */}
      <AllProductsContent searchParamsPromise={searchParams} />
    </Suspense>
  );
}
