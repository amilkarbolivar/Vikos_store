import {
  toErrorResponse as toSharedErrorResponse,
  type ErrorLogger,
} from '../../shared/presentation/http-error-mapper';

export type { ErrorLogger } from '../../shared/presentation/http-error-mapper';

/**
 * Las categorías solo producen errores genéricos (validación, 404, 409, auth): los resuelve el
 * mapper compartido. Este archivo fija el contexto del log, igual que el módulo de productos.
 */
export function toErrorResponse(error: unknown, logger?: ErrorLogger): Response {
  return toSharedErrorResponse(error, logger, { context: 'categorías' });
}
