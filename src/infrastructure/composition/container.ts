/**
 * Raíz de composición: el ÚNICO lugar que conoce a la vez los casos de uso y
 * las implementaciones concretas de los repositorios.
 *
 * Las rutas API, Server Actions y páginas piden aquí los casos de uso ya
 * armados con `getContainer()`; no instancian repositorios por su cuenta.
 *
 * Este archivo solo sabe armar los casos de uso a partir de CONTRATOS de
 * repositorio; no importa Prisma. Por eso se puede probar sin base de datos. El
 * cableado real con Prisma está en `prisma-container.ts`.
 */

import { CreateCategory } from "../../modules/categories/application/create-category.ts";
import { GetCategoryById } from "../../modules/categories/application/get-category-by-id.ts";
import { GetCategoryBySlug } from "../../modules/categories/application/get-category-by-slug.ts";
import { ListCategories } from "../../modules/categories/application/list-categories.ts";
import {
  DeactivateCategory,
  ReactivateCategory,
} from "../../modules/categories/application/set-category-status.ts";
import { UpdateCategory } from "../../modules/categories/application/update-category.ts";
import type { CategoryRepository } from "../../modules/categories/domain/category-repository.ts";
import { CreateProduct } from "../../modules/products/application/create-product.ts";
import { DeactivateProduct } from "../../modules/products/application/deactivate-product.ts";
import { DeleteProduct } from "../../modules/products/application/delete-product.ts";
import { GetProductById } from "../../modules/products/application/get-product-by-id.ts";
import { GetProductBySlug } from "../../modules/products/application/get-product-by-slug.ts";
import { GetPublicProduct } from "../../modules/products/application/get-public-product.ts";
import { ListProducts } from "../../modules/products/application/list-products.ts";
import { UpdateProduct } from "../../modules/products/application/update-product.ts";
import type { ProductRepository } from "../../modules/products/domain/product-repository.ts";

export interface Container {
  categories: {
    create: CreateCategory;
    getById: GetCategoryById;
    getBySlug: GetCategoryBySlug;
    list: ListCategories;
    update: UpdateCategory;
    deactivate: DeactivateCategory;
    reactivate: ReactivateCategory;
  };
  products: {
    create: CreateProduct;
    getById: GetProductById;
    getBySlug: GetProductBySlug;
    getPublic: GetPublicProduct;
    list: ListProducts;
    update: UpdateProduct;
    deactivate: DeactivateProduct;
    delete: DeleteProduct;
  };
}

/** Arma un contenedor a partir de repositorios dados. Exportada para poder probarla. */
export function buildContainer(deps: {
  categories: CategoryRepository;
  products: ProductRepository;
}): Container {
  const { categories, products } = deps;
  return {
    categories: {
      create: new CreateCategory({ categories }),
      getById: new GetCategoryById({ categories }),
      getBySlug: new GetCategoryBySlug({ categories }),
      list: new ListCategories({ categories }),
      update: new UpdateCategory({ categories }),
      deactivate: new DeactivateCategory({ categories }),
      reactivate: new ReactivateCategory({ categories }),
    },
    products: {
      create: new CreateProduct(products, categories),
      getById: new GetProductById(products),
      getBySlug: new GetProductBySlug(products),
      getPublic: new GetPublicProduct(products, categories),
      list: new ListProducts(products),
      update: new UpdateProduct(products, categories),
      deactivate: new DeactivateProduct(products),
      delete: new DeleteProduct(products),
    },
  };
}
