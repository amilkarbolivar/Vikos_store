import { notFound } from "next/navigation";

import { getCategory, getProduct } from "@/services/catalog-service";

import { ProductDetail } from "../catalog/product-detail";

interface ProductContentProps {
  /** Promesa con los parámetros de la URL (ver explicación en `CategoryContent`). */
  paramsPromise: Promise<{ slug: string }>;
}

/** Carga los datos de /productos/<slug>: el producto y, si tiene, su categoría. */
export async function ProductContent({ paramsPromise }: ProductContentProps) {
  const { slug } = await paramsPromise;

  // Producto inexistente, oculto o de una categoría desactivada → página 404.
  const product = await getProduct(slug);
  if (!product) notFound();

  const category = product.categoryId ? await getCategory(product.categoryId) : null;

  return <ProductDetail product={product} category={category} />;
}
