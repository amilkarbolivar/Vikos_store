import { ValidationError } from '../../shared/domain/errors';
import { isUuid } from '../../shared/domain/uuid';
import { wantsInactive, type RequireAdmin } from '../../shared/presentation/admin-guard';
import type { Product } from '../domain/product';
import type { ProductListFilter } from '../domain/product-repository';
import { toErrorResponse, type ErrorLogger } from './http-error-mapper';
import { toProductResponse } from './product-presenter';

export interface ListProductsHandlerDeps {
  listProducts: { execute(filter: ProductListFilter): Promise<Product[]> };
  /** Necesario solo para `?includeInactive=true`. Sin él, esa opción responde 401. */
  requireAdmin?: RequireAdmin;
  logger?: ErrorLogger;
}

/**
 * GET /api/productos[?categoryId=<uuid>][&includeInactive=true]
 * Público: solo productos visibles en la tienda. Con `includeInactive=true` (solo
 * administradores) devuelve también los ocultos.
 */
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

      const includeInactive = await wantsInactive(request, deps.requireAdmin);

      const products = await deps.listProducts.execute({
        onlyAvailable: !includeInactive,
        ...(categoryId !== null ? { categoryId } : {}),
      });

      return Response.json(
        { data: products.map(toProductResponse) },
        includeInactive ? { headers: { 'Cache-Control': 'private, no-store' } } : undefined,
      );
    } catch (error) {
      return toErrorResponse(error, logger);
    }
  };
}
