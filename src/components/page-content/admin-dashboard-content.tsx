import Link from "next/link";

import { ProductImage } from "@/components/catalog/product-image";
import { PlusIcon } from "@/components/admin/admin-icons";
import { PageHeader } from "@/components/admin/common/page-header";
import { StatCard } from "@/components/admin/common/stat-card";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { formatPrice } from "@/lib/format-price";
import { getAdminCategories, getAdminProducts } from "@/services/admin-service";

/**
 * Resumen del panel: cifras clave, un aviso si hay productos que el administrador cree
 * visibles pero que NO se ven en la tienda, y los últimos productos creados.
 */
export async function AdminDashboardContent() {
  // Las dos listas se piden a la vez.
  const [products, categories] = await Promise.all([getAdminProducts(), getAdminCategories()]);

  const visible = products.filter((p) => p.isAvailable).length;
  const activeCategories = categories.filter((c) => c.isActive).length;

  // Marcados como visibles, pero su categoría está desactivada → la tienda no los muestra.
  const inactiveCategoryIds = new Set(categories.filter((c) => !c.isActive).map((c) => c.id));
  const hiddenByCategory = products.filter((p) => p.isAvailable && p.categoryId && inactiveCategoryIds.has(p.categoryId)).length;

  const recent = [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  return (
    <>
      <PageHeader
        title="Resumen"
        description="Un vistazo rápido a tu tienda."
        actions={
          <ButtonLink href="/admin/productos/nuevo">
            <PlusIcon />
            Nuevo producto
          </ButtonLink>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Productos visibles" value={visible} hint="Los que ven tus clientes" href="/admin/productos" />
        <StatCard label="Productos ocultos" value={products.length - visible} hint="Solo los ves tú" href="/admin/productos" />
        <StatCard label="Categorías activas" value={activeCategories} href="/admin/categorias" />
        <StatCard label="Categorías desactivadas" value={categories.length - activeCategories} href="/admin/categorias" />
      </div>

      {hiddenByCategory > 0 && (
        <Alert tone="info" className="mt-6">
          {hiddenByCategory === 1 ? "Hay 1 producto marcado como visible que no aparece" : `Hay ${hiddenByCategory} productos marcados como visibles que no aparecen`}{" "}
          en la tienda porque su categoría está desactivada.{" "}
          <Link href="/admin/categorias" className="font-bold underline">
            Revisar categorías
          </Link>
        </Alert>
      )}

      <section className="mt-8" aria-labelledby="recientes">
        <h2 id="recientes" className="mb-3 text-lg font-bold text-ink">
          Últimos productos
        </h2>
        {recent.length === 0 ? (
          <p className="rounded-card border border-dashed border-line bg-white p-6 text-center text-sm text-muted">
            Aún no hay productos. Crea el primero con el botón «Nuevo producto».
          </p>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-white shadow-card">
            {recent.map((product) => (
              <li key={product.id}>
                <Link href={`/admin/productos/${product.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-brand-50">
                  <ProductImage src={product.imageUrl} alt="" className="size-12 shrink-0 rounded-lg" />
                  <span className="min-w-0 flex-1 truncate font-semibold text-ink">{product.name}</span>
                  <span className="shrink-0 text-sm font-semibold text-brand-700">{formatPrice(product.price)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
