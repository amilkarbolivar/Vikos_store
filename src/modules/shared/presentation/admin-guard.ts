import { ForbiddenError, UnauthorizedError, ValidationError } from '../domain/errors';
import { isUuid } from '../domain/uuid';

/** Contrato de `requireAdmin`: lanza UnauthorizedError (401) o ForbiddenError (403). */
export type RequireAdmin = (request: Request) => Promise<unknown>;

/**
 * Pregunta si quien llama es administrador SIN rechazar la petición: sirve para endpoints
 * públicos que muestran más datos a un administrador. Solo absorbe 401/403; cualquier otro
 * error (por ejemplo, la base de datos caída) se propaga.
 */
export async function isAdminRequest(
  requireAdmin: RequireAdmin | undefined,
  request: Request,
): Promise<boolean> {
  if (!requireAdmin) return false;
  try {
    await requireAdmin(request);
    return true;
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) return false;
    throw error;
  }
}

/**
 * Lee `?includeInactive=true|false`. Devuelve `true` solo si se pidió y quien llama es
 * administrador; si lo pide un anónimo, lanza 401 (no se ignora en silencio).
 */
export async function wantsInactive(
  request: Request,
  requireAdmin: RequireAdmin | undefined,
): Promise<boolean> {
  const raw = new URL(request.url).searchParams.get('includeInactive');
  if (raw === null || raw === 'false') return false;
  if (raw !== 'true') {
    throw new ValidationError([
      { field: 'includeInactive', message: 'includeInactive debe ser true o false' },
    ]);
  }
  if (!requireAdmin) throw new UnauthorizedError();
  await requireAdmin(request);
  return true;
}

/** Valida un identificador de la ruta que debe ser UUID (operaciones sobre un registro concreto). */
export function requireUuidParam(value: string, field = 'id'): string {
  if (!isUuid(value)) {
    throw new ValidationError([{ field, message: 'El identificador debe ser un UUID válido' }]);
  }
  return value;
}
