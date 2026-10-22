import type { Metadata } from "next";
import { Suspense } from "react";

import { CatalogBrowserSkeleton } from "@/components/catalog/catalog-browser";
import { AllProductsContent } from "@/components/page-content/all-products-content";

/** Título y descripción de la pestaña / Google. El título final es "Tienda | Vikos Store". */
export const metadata: Metadata = {
  title: "Tienda",
  description: "Explora todos nuestros regalos y pídelos por WhatsApp.",
};

/** TIENDA ( /productos ): todos los productos visibles, con filtro por categoría. */
export default function ProductsPage() {
  return (
    <Suspense fallback={<CatalogBrowserSkeleton />}>
      <AllProductsContent />
    </Suspense>
  );
}
