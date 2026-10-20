import { NotFoundError } from '../../shared/domain/errors';
import { isUuid } from '../../shared/domain/uuid';
import { isAdminRequest, type RequireAdmin } from '../../shared/presentation/admin-guard';
import type { Category } from '../domain/category';
import { toCategoryResponse } from './category-presenter';
import { toErrorResponse, type ErrorLogger } from './http-error-mapper';

export interface GetCategoryHandlerDeps {
  /** Solo se usa para decidir qué ve quien llama; nunca rechaza la petición. */
  requireAdmin: RequireAdmin;
  getCategoryById: { execute(id: string): Promise<Category> };
  getCategoryBySlug: { execute(slug: string): Promise<Category> };
  logger?: ErrorLogger;
}

/**
 * Adaptador HTTP de GET /api/categorias/:idOrSlug.
 * Los casos de uso devuelven también categorías inactivas; la decisión de visibilidad es de esta
 * capa: el público recibe 404 si está inactiva, un administrador la ve (para reactivarla).
 */
export function getCategoryHandler(deps: GetCategoryHandlerDeps) {
  const logger = deps.logger ?? console;

  return async function handle(request: Request, idOrSlug: string): Promise<Response> {
    try {
      const category = isUuid(idOrSlug)
        ? await deps.getCategoryById.execute(idOrSlug)
        : await deps.getCategoryBySlug.execute(idOrSlug);

      if (!category.isActive && !(await isAdminRequest(deps.requireAdmin, request))) {
        throw new NotFoundError('Categoría', idOrSlug);
      }

      return Response.json(toCategoryResponse(category), {
        headers: { 'Cache-Control': 'private, no-store' },
      });
    } catch (error) {
      return toErrorResponse(error, logger);
    }
  };
}
