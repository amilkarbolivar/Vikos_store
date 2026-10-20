import { requireUuidParam, type RequireAdmin } from '../../shared/presentation/admin-guard';
import { toErrorResponse, type ErrorLogger } from './http-error-mapper';

export interface DeleteProductHandlerDeps {
  requireAdmin: RequireAdmin;
  deleteProduct: { execute(id: string): Promise<void> };
  logger?: ErrorLogger;
}

/**
 * Adaptador HTTP de DELETE /api/productos/:id. Eliminación definitiva (204 sin cuerpo).
 * Para ocultar un producto sin perderlo, usar POST /api/productos/:id/desactivar.
 */
export function deleteProductHandler(deps: DeleteProductHandlerDeps) {
  const logger = deps.logger ?? console;

  return async function handle(request: Request, id: string): Promise<Response> {
    try {
      await deps.requireAdmin(request);
      requireUuidParam(id);

      await deps.deleteProduct.execute(id);
      return new Response(null, { status: 204 });
    } catch (error) {
      return toErrorResponse(error, logger);
    }
  };
}
