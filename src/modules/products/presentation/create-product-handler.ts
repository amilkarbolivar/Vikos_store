import {
  PayloadTooLargeError,
  ValidationError,
} from '../../shared/domain/errors';
import type { CreateProductInput } from '../application/create-product';
import type { Product } from '../domain/product';
import { parseCreateProductBody } from './create-product-request';
import { toErrorResponse, type ErrorLogger } from './http-error-mapper';
import { toProductResponse } from './product-presenter';

const MAX_BODY_BYTES = 100_000;

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

async function readJsonBody(request: Request): Promise<unknown> {
  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    throw new PayloadTooLargeError();
  }

  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) {
    throw new PayloadTooLargeError();
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new ValidationError([{ field: 'body', message: 'El cuerpo debe ser JSON válido' }]);
  }
}
