import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminPageSkeleton } from "@/components/admin/common/admin-skeleton";
import { AdminDashboardContent } from "@/components/page-content/admin-dashboard-content";

export const metadata: Metadata = { title: "Resumen" };

/** RESUMEN ( /admin ): cifras y últimos productos. */
export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<AdminPageSkeleton rows={4} />}>
      <AdminDashboardContent />
    </Suspense>
  );
}
