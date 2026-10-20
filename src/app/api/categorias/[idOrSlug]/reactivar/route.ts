import { getContainer } from '@/infrastructure/composition/prisma-container';
import { requireAdmin } from '@/infrastructure/composition/require-admin-composition';
import { setCategoryStatusHandler } from '@/modules/categories/presentation/set-category-status-handler';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ idOrSlug: string }> },
): Promise<Response> {
  const { idOrSlug } = await params;
  return setCategoryStatusHandler({
    requireAdmin,
    setStatus: { execute: (id) => getContainer().categories.reactivate.execute(id) },
  })(request, idOrSlug);
}
