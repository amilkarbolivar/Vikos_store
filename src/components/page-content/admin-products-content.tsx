import { PageHeader } from "@/components/admin/common/page-header";
import { ProductsManager } from "@/components/admin/products/products-manager";
import { adminConfig, type AdminNoticeKey } from "@/config/admin";
import { firstParam } from "@/lib/search-params";
import { getAdminCategories, getAdminProducts } from "@/services/admin-service";

interface AdminProductsContentProps {
  /** `?aviso=...` llega como PROMESA y se espera aquí, dentro del <Suspense> (ver las otras páginas). */
  searchParamsPromise: Promise<{ aviso?: string | string[] }>;
}

/** Carga todos los productos (también los ocultos) y las categorías. */
export async function AdminProductsContent({ searchParamsPromise }: AdminProductsContentProps) {
  const { aviso } = await searchParamsPromise;
  const [products, categories] = await Promise.all([getAdminProducts(), getAdminCategories()]);

  // Solo se muestran avisos de la lista permitida: un texto cualquiera en la URL se ignora.
  const key = firstParam(aviso);
  const notice = key && key in adminConfig.notices ? adminConfig.notices[key as AdminNoticeKey] : undefined;

  return (
    <>
      <PageHeader title="Productos" description="Crea, edita, oculta o elimina los productos de la tienda." />
      <ProductsManager products={products} categories={categories} notice={notice} />
    </>
  );
}
