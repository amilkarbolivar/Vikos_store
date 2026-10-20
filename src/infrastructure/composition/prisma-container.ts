import { PrismaCategoryRepository } from "../../modules/categories/infrastructure/category-repository-impl.ts";
import { createCategoryDelegate } from "../../modules/categories/infrastructure/category-delegate.ts";
import { ProductRepositoryImpl } from "../../modules/products/infrastructure/product-repository-impl.ts";
import { getPrisma } from "../database/prisma.ts";
import { buildContainer, type Container } from "./container.ts";

let container: Container | undefined;

/** Contenedor real, con repositorios Prisma. Se arma una sola vez por proceso. */
export function getContainer(): Container {
  if (!container) {
    const prisma = getPrisma();
    container = buildContainer({
      categories: new PrismaCategoryRepository(createCategoryDelegate(prisma)),
      products: new ProductRepositoryImpl(prisma),
    });
  }
  return container;
}
