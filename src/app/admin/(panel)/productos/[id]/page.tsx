import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminPageSkeleton } from "@/components/admin/common/admin-skeleton";
import { AdminProductEditContent } from "@/components/page-content/admin-product-form-content";

export const metadata: Metadata = { title: "Editar producto" };

type Props = { params: Promise<{ id: string }> };

/** EDITAR PRODUCTO ( /admin/productos/<id> ). */
export default function AdminProductEditPage({ params }: Props) {
  return (
    <Suspense fallback={<AdminPageSkeleton rows={4} />}>
      <AdminProductEditContent paramsPromise={params} />
    </Suspense>
  );
}
