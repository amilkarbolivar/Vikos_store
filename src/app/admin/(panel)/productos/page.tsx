import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminPageSkeleton } from "@/components/admin/common/admin-skeleton";
import { AdminProductsContent } from "@/components/page-content/admin-products-content";

export const metadata: Metadata = { title: "Productos" };

type Props = { searchParams: Promise<{ aviso?: string | string[] }> };

/** PRODUCTOS ( /admin/productos ): lista, filtros y acciones. */
export default function AdminProductsPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<AdminPageSkeleton />}>
      {/* Se pasa la PROMESA de `searchParams` sin esperarla aquí. */}
      <AdminProductsContent searchParamsPromise={searchParams} />
    </Suspense>
  );
}
