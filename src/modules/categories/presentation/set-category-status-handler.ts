import { requireUuidParam, type RequireAdmin } from '../../shared/presentation/admin-guard';
import type { Category } from '../domain/category';
import { toCategoryResponse } from './category-presenter';
import { toErrorResponse, type ErrorLogger } from './http-error-mapper';

export interface SetCategoryStatusHandlerDeps {
  requireAdmin: RequireAdmin;
  /** `DeactivateCategory` o `ReactivateCategory`: el mismo adaptador sirve para ambos. */
  setStatus: { execute(id: string): Promise<Category> };
  logger?: ErrorLogger;
}

/**
 * Adaptador HTTP de POST /api/categorias/:id/desactivar y /reactivar (idempotentes).
 * Las categorías no se borran: los productos las referencian.
 */
export function setCategoryStatusHandler(deps: SetCategoryStatusHandlerDeps) {
  const logger = deps.logger ?? console;

  return async function handle(request: Request, id: string): Promise<Response> {
    try {
      await deps.requireAdmin(request);
      requireUuidParam(id);

      const category = await deps.setStatus.execute(id);
      return Response.json(toCategoryResponse(category));
    } catch (error) {
      return toErrorResponse(error, logger);
    }
  };
}
