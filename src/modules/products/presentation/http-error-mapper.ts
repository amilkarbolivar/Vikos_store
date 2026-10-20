import { errorBody, toErrorResponse as toSharedErrorResponse } from '../../shared/presentation/http-error-mapper';
import type { ErrorLogger, ModuleErrorMapper } from '../../shared/presentation/http-error-mapper';
import {
  CategoryInactiveError,
  CategoryNotFoundError,
  DuplicateSkuError,
  DuplicateSlugError,
  ProductNotFoundError,
} from '../domain/errors';

export type { ErrorLogger, HttpErrorBody } from '../../shared/presentation/http-error-mapper';

/** Errores propios del módulo de productos. Los genéricos los resuelve el mapper compartido. */
const mapProductError: ModuleErrorMapper = (error) => {
  if (error instanceof CategoryNotFoundError || error instanceof CategoryInactiveError) {
    return Response.json(
      errorBody(error.code, error.message, [{ field: 'categoryId', message: error.message }]),
      { status: 422 },
    );
  }
  if (error instanceof DuplicateSlugError) {
    return Response.json(
      errorBody(error.code, error.message, [{ field: 'slug', message: error.message }]),
      { status: 409 },
    );
  }
  if (error instanceof DuplicateSkuError) {
    return Response.json(errorBody(error.code, error.message), { status: 409 });
  }
  if (error instanceof ProductNotFoundError) {
    return Response.json(errorBody(error.code, error.message), { status: 404 });
  }
  return undefined;
};

/** Traduce cualquier error a una respuesta HTTP (ver el mapper compartido). */
export function toErrorResponse(error: unknown, logger?: ErrorLogger): Response {
  return toSharedErrorResponse(error, logger, {
    context: 'productos',
    mapModuleError: mapProductError,
  });
}
