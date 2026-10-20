import {
  AppError,
  BusinessRuleError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  PayloadTooLargeError,
  UnauthorizedError,
  ValidationError,
  type ValidationIssue,
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

/** Traduce los errores propios de un módulo. Devuelve `undefined` si no los reconoce. */
export type ModuleErrorMapper = (error: unknown) => Response | undefined;

export interface ToErrorResponseOptions {
  /** Nombre del recurso para el log del 500 (por ejemplo "productos"). */
  context?: string;
  /** Errores específicos del módulo (por ejemplo un slug repetido con su campo). */
  mapModuleError?: ModuleErrorMapper;
}

export function errorBody(
  code: string,
  message: string,
  details?: ValidationIssue[],
): HttpErrorBody {
  return { error: { code, message, ...(details ? { details } : {}) } };
}

/**
 * Traduce cualquier error a una respuesta HTTP.
 * Los errores no reconocidos devuelven un 500 genérico: nunca se expone el mensaje original,
 * trazas ni datos de conexión. En el log solo se escribe el tipo y el código del error.
 */
export function toErrorResponse(
  error: unknown,
  logger?: ErrorLogger,
  options: ToErrorResponseOptions = {},
): Response {
  if (error instanceof ValidationError) {
    return Response.json(errorBody(error.code, 'Los datos enviados no son válidos', error.issues), {
      status: 400,
    });
  }
  if (error instanceof PayloadTooLargeError) {
    return Response.json(errorBody(error.code, error.message), { status: 413 });
  }
  if (error instanceof UnauthorizedError) {
    return Response.json(errorBody(error.code, error.message), { status: 401 });
  }
  if (error instanceof ForbiddenError) {
    return Response.json(errorBody(error.code, error.message), { status: 403 });
  }
  if (error instanceof NotFoundError) {
    return Response.json(errorBody(error.code, error.message), { status: 404 });
  }
  if (error instanceof ConflictError) {
    return Response.json(errorBody(error.code, error.message), { status: 409 });
  }
  if (error instanceof BusinessRuleError) {
    return Response.json(errorBody(error.code, error.message), { status: 422 });
  }

  const moduleResponse = options.mapModuleError?.(error);
  if (moduleResponse) return moduleResponse;

  const cause = error instanceof Error ? error.cause : undefined;
  logger?.error(
    `Error no controlado al procesar la petición de ${options.context ?? 'la API'}`,
    {
      errorName: error instanceof Error ? error.name : typeof error,
      errorCode: error instanceof AppError ? error.code : undefined,
      causeName: cause instanceof Error ? cause.name : undefined,
      causeCode:
        typeof cause === 'object' && cause !== null && 'code' in cause
          ? String((cause as { code: unknown }).code)
          : undefined,
    },
  );
  return Response.json(errorBody('INTERNAL_ERROR', 'Error interno del servidor'), { status: 500 });
}
