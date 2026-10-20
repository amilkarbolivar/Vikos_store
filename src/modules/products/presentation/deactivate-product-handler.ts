import { requireUuidParam, type RequireAdmin } from '../../shared/presentation/admin-guard';
import type { Product } from '../domain/product';
import { toErrorResponse, type ErrorLogger } from './http-error-mapper';
import { toProductResponse } from './product-presenter';

export interface DeactivateProductHandlerDeps {
  requireAdmin: RequireAdmin;
  deactivateProduct: { execute(id: string): Promise<Product> };
  logger?: ErrorLogger;
}

/** Adaptador HTTP de POST /api/productos/:id/desactivar (borrado lógico, idempotente). */
export function deactivateProductHandler(deps: DeactivateProductHandlerDeps) {
  const logger = deps.logger ?? console;

  return async function handle(request: Request, id: string): Promise<Response> {
    try {
      await deps.requireAdmin(request);
      requireUuidParam(id);

      const product = await deps.deactivateProduct.execute(id);
      return Response.json(toProductResponse(product));
    } catch (error) {
      return toErrorResponse(error, logger);
    }
  };
}
