import type { Metadata } from "next";
import { Suspense } from "react";

import { ProductDetailSkeleton } from "@/components/catalog/product-detail";
import { ProductContent } from "@/components/page-content/product-content";
import { truncate } from "@/lib/truncate";
import { getProduct } from "@/services/catalog-service";

type Props = { params: Promise<{ slug: string }> };

/**
 * Título, descripción e imagen que se ven en Google y al compartir el enlace por WhatsApp,
 * Instagram, etc. (Open Graph). Usa los datos reales del producto.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) return { title: "Producto no encontrado" };

  const description = truncate(product.description || `Pide ${product.name} por WhatsApp.`);

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      ...(product.imageUrl ? { images: [product.imageUrl] } : {}),
    },
  };
}

/** DETALLE ( /productos/<slug> ): la ficha completa de un producto. */
export default function ProductPage({ params }: Props) {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductContent paramsPromise={params} />
    </Suspense>
  );
}
