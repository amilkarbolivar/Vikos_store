import { readJsonBody } from '../../shared/presentation/read-json-body';
import { requireUuidParam, type RequireAdmin } from '../../shared/presentation/admin-guard';
import type { UpdateProductInput } from '../application/update-product';
import type { Product } from '../domain/product';
import { toErrorResponse, type ErrorLogger } from './http-error-mapper';
import { toProductResponse } from './product-presenter';
import { parseUpdateProductBody } from './update-product-request';

export interface UpdateProductHandlerDeps {
  requireAdmin: RequireAdmin;
  updateProduct: { execute(id: string, input: UpdateProductInput): Promise<Product> };
  logger?: ErrorLogger;
}

/** Adaptador HTTP de PATCH /api/productos/:id (actualización parcial, solo administradores). */
export function updateProductHandler(deps: UpdateProductHandlerDeps) {
  const logger = deps.logger ?? console;

  return async function handle(request: Request, id: string): Promise<Response> {
    try {
      await deps.requireAdmin(request);
      requireUuidParam(id);

      const input = parseUpdateProductBody(await readJsonBody(request));
      const product = await deps.updateProduct.execute(id, input);

      return Response.json(toProductResponse(product));
    } catch (error) {
      return toErrorResponse(error, logger);
    }
  };
}
