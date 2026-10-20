import { requireUuidParam, type RequireAdmin } from '../../shared/presentation/admin-guard';
import { readJsonBody } from '../../shared/presentation/read-json-body';
import type { UpdateCategoryInput } from '../application/update-category';
import type { Category } from '../domain/category';
import { parseUpdateCategoryBody } from './category-request';
import { toCategoryResponse } from './category-presenter';
import { toErrorResponse, type ErrorLogger } from './http-error-mapper';

export interface UpdateCategoryHandlerDeps {
  requireAdmin: RequireAdmin;
  updateCategory: { execute(id: string, input: UpdateCategoryInput): Promise<Category> };
  logger?: ErrorLogger;
}

/** Adaptador HTTP de PATCH /api/categorias/:id (actualización parcial, solo administradores). */
export function updateCategoryHandler(deps: UpdateCategoryHandlerDeps) {
  const logger = deps.logger ?? console;

  return async function handle(request: Request, id: string): Promise<Response> {
    try {
      await deps.requireAdmin(request);
      requireUuidParam(id);

      const input = parseUpdateCategoryBody(await readJsonBody(request));
      const category = await deps.updateCategory.execute(id, input);

      return Response.json(toCategoryResponse(category));
    } catch (error) {
      return toErrorResponse(error, logger);
    }
  };
}
