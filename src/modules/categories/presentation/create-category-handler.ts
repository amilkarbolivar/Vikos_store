import type { RequireAdmin } from '../../shared/presentation/admin-guard';
import { readJsonBody } from '../../shared/presentation/read-json-body';
import type { CreateCategoryInput } from '../application/create-category';
import type { Category } from '../domain/category';
import { parseCreateCategoryBody } from './category-request';
import { toCategoryResponse } from './category-presenter';
import { toErrorResponse, type ErrorLogger } from './http-error-mapper';

export interface CreateCategoryHandlerDeps {
  requireAdmin: RequireAdmin;
  createCategory: { execute(input: CreateCategoryInput): Promise<Category> };
  logger?: ErrorLogger;
}

/** Adaptador HTTP de POST /api/categorias (solo administradores). */
export function createCategoryHandler(deps: CreateCategoryHandlerDeps) {
  const logger = deps.logger ?? console;

  return async function handle(request: Request): Promise<Response> {
    try {
      await deps.requireAdmin(request);

      const input = parseCreateCategoryBody(await readJsonBody(request));
      const category = await deps.createCategory.execute(input);

      return Response.json(toCategoryResponse(category), {
        status: 201,
        headers: { Location: `/api/categorias/${category.slug}` },
      });
    } catch (error) {
      return toErrorResponse(error, logger);
    }
  };
}
