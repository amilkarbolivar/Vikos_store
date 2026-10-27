import { CategoriesManager } from "@/components/admin/categories/categories-manager";
import { PageHeader } from "@/components/admin/common/page-header";
import { getAdminCategories, getAdminProducts } from "@/services/admin-service";

/** Carga las categorías (también las desactivadas) y cuántos productos tiene cada una. */
export async function AdminCategoriesContent() {
  const [categories, products] = await Promise.all([getAdminCategories(), getAdminProducts()]);

  // { idCategoría: cantidad de productos }
  const productCounts: Record<string, number> = {};
  for (const product of products) {
    if (product.categoryId) productCounts[product.categoryId] = (productCounts[product.categoryId] ?? 0) + 1;
  }

  return (
    <>
      <PageHeader
        title="Categorías"
        description="Organiza tus productos. Al desactivar una categoría, sus productos dejan de verse en la tienda (no se borran)."
      />
      <CategoriesManager categories={categories} productCounts={productCounts} />
    </>
  );
}
