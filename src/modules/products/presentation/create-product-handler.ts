import { readJsonBody } from '../../shared/presentation/read-json-body';
import type { CreateProductInput } from '../application/create-product';
import type { Product } from '../domain/product';
import { parseCreateProductBody } from './create-product-request';
import { toErrorResponse, type ErrorLogger } from './http-error-mapper';
import { toProductResponse } from './product-presenter';

export interface CreateProductHandlerDeps {
  /** Debe lanzar UnauthorizedError (401) o ForbiddenError (403) si quien llama no es administrador. */
  requireAdmin: (request: Request) => Promise<unknown>;
  createProduct: { execute(input: CreateProductInput): Promise<Product> };
  logger?: ErrorLogger;
}

/**
 * Adaptador HTTP de POST /api/productos. Solo orquesta:
 * autorización -> JSON -> estructura -> caso de uso -> presenter -> respuesta.
 * No contiene reglas de negocio, consultas ni slugs.
 */
export function createProductHandler(deps: CreateProductHandlerDeps) {
  const logger = deps.logger ?? console;

  return async function handle(request: Request): Promise<Response> {
    try {
      await deps.requireAdmin(request);

      const body = await readJsonBody(request);
      const input = parseCreateProductBody(body);
      const product = await deps.createProduct.execute(input);

      return Response.json(toProductResponse(product), {
        status: 201,
        headers: { Location: `/api/productos/${product.slug}` },
      });
    } catch (error) {
      return toErrorResponse(error, logger);
    }
  };
}
