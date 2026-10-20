import { UnauthorizedError } from '../../shared/domain/errors';
import type { AuthenticatedAdmin } from '../domain/user';
import { readSessionToken } from './session-cookie';

export interface AdminSession {
  userId: string;
  /** Ausente solo en el bypass de pruebas locales. */
  email?: string;
  role: 'ADMIN';
}

export interface RequireAdminDeps {
  getCurrentAdmin: { execute(token: string | undefined): Promise<AuthenticatedAdmin> };
}

/**
 * Crea `requireAdmin`: verifica en el SERVIDOR, en cada petición, que la cookie de sesión sea
 * válida y que el usuario siga existiendo y activo. Lanza UnauthorizedError (401) si no.
 *
 * Es una fábrica para que esta capa no dependa de Prisma: la composición (ver
 * `infrastructure/composition/require-admin-composition.ts`) le inyecta el caso de uso.
 */
export function createRequireAdmin(deps: RequireAdminDeps) {
  return async function requireAdmin(request: Request): Promise<AdminSession> {
    // SOLO PARA PRUEBAS LOCALES: borrar este bloque antes de subir el código.
    if (
      process.env.NODE_ENV !== 'production' &&
      process.env.ALLOW_INSECURE_ADMIN_BYPASS === 'true'
    ) {
      return { userId: 'bypass-de-prueba', role: 'ADMIN' };
    }

    // Sin cookie no hay nada que verificar: se responde 401 sin tocar la base de datos ni exigir
    // SESSION_SECRET. Así los endpoints públicos funcionan para visitantes anónimos siempre.
    const token = readSessionToken(request);
    if (!token) throw new UnauthorizedError();

    const admin = await deps.getCurrentAdmin.execute(token);
    return { userId: admin.id, email: admin.email, role: 'ADMIN' };
  };
}
