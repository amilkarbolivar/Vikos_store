import { ListProducts } from '../../modules/products/application/list-products';
import { ProductRepositoryImpl } from '../../modules/products/infrastructure/product-repository-impl';
import { getPrisma } from '../database/prisma';

let listProducts: ListProducts | undefined;

export function getListProducts(): ListProducts {
  if (!listProducts) {
    listProducts = new ListProducts(new ProductRepositoryImpl(getPrisma()));
  }
  return listProducts;
}