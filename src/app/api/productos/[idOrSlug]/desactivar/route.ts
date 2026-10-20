import { getContainer } from '@/infrastructure/composition/prisma-container';
import { requireAdmin } from '@/infrastructure/composition/require-admin-composition';
import { deactivateProductHandler } from '@/modules/products/presentation/deactivate-product-handler';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ idOrSlug: string }> },
): Promise<Response> {
  const { idOrSlug } = await params;
  return deactivateProductHandler({
    requireAdmin,
    deactivateProduct: { execute: (id) => getContainer().products.deactivate.execute(id) },
  })(request, idOrSlug);
}
