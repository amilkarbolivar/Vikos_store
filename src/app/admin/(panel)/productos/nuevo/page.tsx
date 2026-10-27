import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminPageSkeleton } from "@/components/admin/common/admin-skeleton";
import { AdminProductNewContent } from "@/components/page-content/admin-product-form-content";

export const metadata: Metadata = { title: "Nuevo producto" };

/** NUEVO PRODUCTO ( /admin/productos/nuevo ). */
export default function AdminProductNewPage() {
  return (
    <Suspense fallback={<AdminPageSkeleton rows={4} />}>
      <AdminProductNewContent />
    </Suspense>
  );
}
