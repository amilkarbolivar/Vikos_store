import { notFound } from "next/navigation";

import { PageHeader } from "@/components/admin/common/page-header";
import { ProductForm } from "@/components/forms/product-form";
import { ButtonLink } from "@/components/ui/button";
import { getAdminCategories, getAdminProduct } from "@/services/admin-service";

/** Página "Nuevo producto": solo necesita las categorías para el selector. */
export async function AdminProductNewContent() {
  const categories = await getAdminCategories();

  return (
    <>
      <PageHeader title="Nuevo producto" description="Completa los datos. Podrás cambiarlos después." />
      <ProductForm categories={categories} />
    </>
  );
}

interface AdminProductEditContentProps {
  /** Promesa con el `id` de la URL; se espera aquí dentro del <Suspense>. */
  paramsPromise: Promise<{ id: string }>;
}

/** Página "Editar producto": carga el producto (también si está oculto) y las categorías. */
export async function AdminProductEditContent({ paramsPromise }: AdminProductEditContentProps) {
  const { id } = await paramsPromise;
  const [product, categories] = await Promise.all([getAdminProduct(id), getAdminCategories()]);

  if (!product) notFound();

  return (
    <>
      <PageHeader
        title="Editar producto"
        description={product.name}
        actions={
          // Solo tiene sentido enlazar a la tienda si el producto se puede ver allí.
          product.isAvailable ? (
            <ButtonLink href={`/productos/${product.slug}`} variant="secondary" size="sm" target="_blank" rel="noopener noreferrer">
              Ver en la tienda
            </ButtonLink>
          ) : undefined
        }
      />
      {/*
        `key` = id + fecha de última modificación. Next.js conserva las páginas visitadas (con
        su estado de React). Si el producto cambió mientras tanto (por ejemplo, se ocultó desde
        la lista), la `key` distinta fuerza a React a crear el formulario de nuevo con los datos
        ACTUALES. Sin esto, el formulario conservado mostraría datos viejos y, al guardar,
        revertiría el cambio sin que nadie lo note.
      */}
      <ProductForm key={`${product.id}:${product.updatedAt}`} categories={categories} product={product} />
    </>
  );
}
