import { getCreateProduct } from '@/infrastructure/composition/create-product-composition';
import { requireAdmin } from '@/modules/auth/presentation/require-admin';
import { createProductHandler } from '@/modules/products/presentation/create-product-handler';
import { listProductsHandler } from '@/modules/products/presentation/list-products-handler';
import { getListProducts } from '@/infrastructure/composition/list-products-composition';

export async function POST(request: Request): Promise<Response> {
  return createProductHandler({
    requireAdmin,
    createProduct: { execute: (input) => getCreateProduct().execute(input) },
  })(request);
}

export async function GET(request: Request): Promise<Response> {
  return listProductsHandler({
    listProducts: { execute: (filter) => getListProducts().execute(filter) },
  })(request);
}