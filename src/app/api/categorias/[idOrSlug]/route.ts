import { getContainer } from '@/infrastructure/composition/prisma-container';
import { requireAdmin } from '@/infrastructure/composition/require-admin-composition';
import { getCategoryHandler } from '@/modules/categories/presentation/get-category-handler';
import { updateCategoryHandler } from '@/modules/categories/presentation/update-category-handler';

type Context = { params: Promise<{ idOrSlug: string }> };

/** Público: id (UUID) o slug. Las categorías inactivas solo las ve un administrador. */
export async function GET(request: Request, { params }: Context): Promise<Response> {
  const { idOrSlug } = await params;
  return getCategoryHandler({
    requireAdmin,
    getCategoryById: { execute: (id) => getContainer().categories.getById.execute(id) },
    getCategoryBySlug: { execute: (slug) => getContainer().categories.getBySlug.execute(slug) },
  })(request, idOrSlug);
}

/** Solo administradores; el segmento debe ser el id (UUID). */
export async function PATCH(request: Request, { params }: Context): Promise<Response> {
  const { idOrSlug } = await params;
  return updateCategoryHandler({
    requireAdmin,
    updateCategory: { execute: (id, input) => getContainer().categories.update.execute(id, input) },
  })(request, idOrSlug);
}
