import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminPageSkeleton } from "@/components/admin/common/admin-skeleton";
import { AdminCategoriesContent } from "@/components/page-content/admin-categories-content";

export const metadata: Metadata = { title: "Categorías" };

/** CATEGORÍAS ( /admin/categorias ): lista y gestión. */
export default function AdminCategoriesPage() {
  return (
    <Suspense fallback={<AdminPageSkeleton />}>
      <AdminCategoriesContent />
    </Suspense>
  );
}
