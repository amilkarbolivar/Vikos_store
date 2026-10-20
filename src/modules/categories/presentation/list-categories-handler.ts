import { wantsInactive, type RequireAdmin } from '../../shared/presentation/admin-guard';
import type { Category } from '../domain/category';
import type { ListCategoriesOptions } from '../domain/category-repository';
import { toCategoryResponse } from './category-presenter';
import { toErrorResponse, type ErrorLogger } from './http-error-mapper';

export interface ListCategoriesHandlerDeps {
  listCategories: { execute(options: ListCategoriesOptions): Promise<Category[]> };
  /** Necesario solo para `?includeInactive=true`. Sin él, esa opción responde 401. */
  requireAdmin?: RequireAdmin;
  logger?: ErrorLogger;
}

/**
 * GET /api/categorias[?includeInactive=true]
 * Público: solo categorías activas. Con `includeInactive=true` (solo administradores)
 * devuelve también las desactivadas.
 */
export function listCategoriesHandler(deps: ListCategoriesHandlerDeps) {
  const logger = deps.logger ?? console;

  return async function handle(request: Request): Promise<Response> {
    try {
      const includeInactive = await wantsInactive(request, deps.requireAdmin);
      const categories = await deps.listCategories.execute({ onlyActive: !includeInactive });

      return Response.json(
        { data: categories.map(toCategoryResponse) },
        includeInactive ? { headers: { 'Cache-Control': 'private, no-store' } } : undefined,
      );
    } catch (error) {
      return toErrorResponse(error, logger);
    }
  };
}
