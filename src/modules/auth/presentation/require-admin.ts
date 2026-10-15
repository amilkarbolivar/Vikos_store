import { UnauthorizedError } from '../../shared/domain/errors';

export interface AdminSession {
  userId: string;
  role: 'ADMIN';
}

export async function requireAdmin(_request: Request): Promise<AdminSession> {
  // SOLO PARA PRUEBAS LOCALES: borrar este bloque antes de subir el código.
  if (
    process.env.NODE_ENV !== 'production' &&
    process.env.ALLOW_INSECURE_ADMIN_BYPASS === 'true'
  ) {
    return { userId: 'bypass-de-prueba', role: 'ADMIN' };
  }

  throw new UnauthorizedError('La verificación de administrador aún no está conectada');
}