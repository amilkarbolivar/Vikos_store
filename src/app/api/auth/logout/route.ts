import { logoutHandler } from '@/modules/auth/presentation/logout-handler';
import { shouldUseSecureCookies } from '@/modules/auth/presentation/session-cookie';

/** Cerrar sesión no necesita leer la petición: solo borra la cookie. */
export async function POST(): Promise<Response> {
  return logoutHandler({ secureCookies: shouldUseSecureCookies() })();
}
