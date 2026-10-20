import { ValidationError, type ValidationIssue } from '../../shared/domain/errors';
import { requireJsonObject } from '../../shared/presentation/read-json-body';
import type { LoginInput } from '../application/login';

const ALLOWED_FIELDS = new Set(['email', 'password']);

/** Valida solo la ESTRUCTURA del JSON de login. Si falta algo no se revela qué usuarios existen. */
export function parseLoginBody(body: unknown): LoginInput {
  const record = requireJsonObject(body);
  const issues: ValidationIssue[] = [];

  for (const key of Object.keys(record)) {
    if (!ALLOWED_FIELDS.has(key)) issues.push({ field: key, message: 'Campo no permitido' });
  }
  if (typeof record.email !== 'string') {
    issues.push({ field: 'email', message: 'El correo es obligatorio y debe ser texto' });
  }
  if (typeof record.password !== 'string') {
    issues.push({ field: 'password', message: 'La contraseña es obligatoria y debe ser texto' });
  }

  if (issues.length > 0) throw new ValidationError(issues);
  return { email: record.email as string, password: record.password as string };
}
