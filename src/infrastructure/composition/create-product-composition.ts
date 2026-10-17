import { CreateProduct } from '../../modules/products/application/create-product';
import { PrismaCategoryReader } from '../../modules/products/infrastructure/prisma-category-reader';
import { ProductRepositoryImpl } from '../../modules/products/infrastructure/product-repository-impl';
import { getPrisma } from '../database/prisma';

let createProduct: CreateProduct | undefined;

export function getCreateProduct(): CreateProduct {
  if (!createProduct) {
    const prisma = getPrisma();
    createProduct = new CreateProduct(
      new ProductRepositoryImpl(prisma),
      new PrismaCategoryReader(prisma),
    );
  }
  return createProduct;
}