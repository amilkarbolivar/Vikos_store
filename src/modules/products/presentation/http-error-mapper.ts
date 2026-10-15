import {
  AppError,
  ForbiddenError,
  PayloadTooLargeError,
  UnauthorizedError,
  ValidationError,
  type ValidationIssue,
} from '../../shared/domain/errors';
import {
  CategoryInactiveError,
  CategoryNotFoundError,
  DuplicateSkuError,
  DuplicateSlugError,
  ProductNotFoundError,
} from '../domain/errors';

export interface HttpErrorBody {
  error: {
    code: string;
    message: string;
    details?: ValidationIssue[];
  };
}

export interface ErrorLogger {
  error(message: string, meta?: Record<string, unknown>): void;
}

function body(code: string, message: string, details?: ValidationIssue[]): HttpErrorBody {
  return { error: { code, message, ...(details ? { details } : {}) } };
}

/**
 * Traduce cualquier error a una respuesta HTTP.
 * Los errores no reconocidos devuelven un 500 genérico: nunca se expone el mensaje original,
 * trazas ni datos de conexión. En el log solo se escribe el tipo y el código del error.
 */
export function toErrorResponse(error: unknown, logger?: ErrorLogger): Response {
  if (error instanceof ValidationError) {
    return Response.json(body(error.code, 'Los datos enviados no son válidos', error.issues), {
      status: 400,
    });
  }
  if (error instanceof PayloadTooLargeError) {
    return Response.json(body(error.code, error.message), { status: 413 });
  }
  if (error instanceof UnauthorizedError) {
    return Response.json(body(error.code, error.message), { status: 401 });
  }
  if (error instanceof ForbiddenError) {
    return Response.json(body(error.code, error.message), { status: 403 });
  }
  if (error instanceof CategoryNotFoundError || error instanceof CategoryInactiveError) {
    return Response.json(
      body(error.code, error.message, [{ field: 'categoryId', message: error.message }]),
      { status: 422 },
    );
  }
  if (error instanceof DuplicateSlugError) {
    return Response.json(
      body(error.code, error.message, [{ field: 'slug', message: error.message }]),
      { status: 409 },
    );
  }
  if (error instanceof DuplicateSkuError) {
    return Response.json(body(error.code, error.message), { status: 409 });
  }
  if (error instanceof ProductNotFoundError) {
    return Response.json(body(error.code, error.message), { status: 404 });
  }

  logger?.error('Error no controlado al procesar la petición de productos', {
    errorName: error instanceof Error ? error.name : typeof error,
    errorCode: error instanceof AppError ? error.code : undefined,
  });
  return Response.json(body('INTERNAL_ERROR', 'Error interno del servidor'), { status: 500 });
}
