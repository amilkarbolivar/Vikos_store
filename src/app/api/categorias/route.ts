import { getContainer } from '@/infrastructure/composition/prisma-container';
import { requireAdmin } from '@/infrastructure/composition/require-admin-composition';
import { createCategoryHandler } from '@/modules/categories/presentation/create-category-handler';
import { listCategoriesHandler } from '@/modules/categories/presentation/list-categories-handler';

export async function GET(request: Request): Promise<Response> {
  return listCategoriesHandler({
    requireAdmin,
    listCategories: { execute: (options) => getContainer().categories.list.execute(options) },
  })(request);
}

export async function POST(request: Request): Promise<Response> {
  return createCategoryHandler({
    requireAdmin,
    createCategory: { execute: (input) => getContainer().categories.create.execute(input) },
  })(request);
}
