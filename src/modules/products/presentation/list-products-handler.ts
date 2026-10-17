import { ValidationError } from '../../shared/domain/errors';
import { isUuid } from '../../shared/domain/uuid';
import type { Product } from '../domain/product';
import type { ProductListFilter } from '../domain/product-repository';
import { toErrorResponse, type ErrorLogger } from './http-error-mapper';
import { toProductResponse } from './product-presenter';

export interface ListProductsHandlerDeps {
  listProducts: { execute(filter: ProductListFilter): Promise<Product[]> };
  logger?: ErrorLogger;
}

export function listProductsHandler(deps: ListProductsHandlerDeps) {
  const logger = deps.logger ?? console;

  return async function handle(request: Request): Promise<Response> {
    try {
      const categoryId = new URL(request.url).searchParams.get('categoryId');

      if (categoryId !== null && !isUuid(categoryId)) {
        throw new ValidationError([
          { field: 'categoryId', message: 'La categoría debe ser un UUID válido' },
        ]);
      }

      const products = await deps.listProducts.execute({
        onlyAvailable: true,
        ...(categoryId !== null ? { categoryId } : {}),
      });

      return Response.json({ data: products.map(toProductResponse) });
    } catch (error) {
      return toErrorResponse(error, logger);
    }
  };
}