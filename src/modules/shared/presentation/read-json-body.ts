import { PayloadTooLargeError, ValidationError } from '../domain/errors';

export const MAX_BODY_BYTES = 100_000;

/** Lee el cuerpo como JSON con un tope de tamaño. Lanza ValidationError / PayloadTooLargeError. */
export async function readJsonBody(request: Request): Promise<unknown> {
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

/** Exige un objeto JSON plano (no arreglo, no null) y lo devuelve como registro. */
export function requireJsonObject(body: unknown): Record<string, unknown> {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new ValidationError([{ field: 'body', message: 'El cuerpo debe ser un objeto JSON' }]);
  }
  return body as Record<string, unknown>;
}
