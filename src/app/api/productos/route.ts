import { getCreateProduct } from '@/infrastructure/composition/create-product-composition';
import { getListProducts } from '@/infrastructure/composition/list-products-composition';
import { requireAdmin } from '@/infrastructure/composition/require-admin-composition';
import { createProductHandler } from '@/modules/products/presentation/create-product-handler';
import { listProductsHandler } from '@/modules/products/presentation/list-products-handler';

export async function POST(request: Request): Promise<Response> {
  return createProductHandler({
    requireAdmin,
    createProduct: { execute: (input) => getCreateProduct().execute(input) },
  })(request);
}

export async function GET(request: Request): Promise<Response> {
  return listProductsHandler({
    requireAdmin,
    listProducts: { execute: (filter) => getListProducts().execute(filter) },
  })(request);
}
