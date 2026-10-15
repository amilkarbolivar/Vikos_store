import { getContainer } from '@/infrastructure/composition/prisma-container';
import { requireAdmin } from '@/modules/auth/presentation/require-admin';
import { createProductHandler } from '@/modules/products/presentation/create-product-handler';

export async function POST(request: Request): Promise<Response> {
  const { products } = getContainer();
  return createProductHandler({ requireAdmin, createProduct: products.create })(request);
}