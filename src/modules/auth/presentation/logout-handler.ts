import { buildClearedSessionCookie } from './session-cookie';

export interface LogoutHandlerDeps {
  secureCookies: boolean;
}

/**
 * Adaptador HTTP de POST /api/auth/logout: borra la cookie de sesión (204). No necesita
 * autenticación: cerrar una sesión que ya no existe es un resultado válido (idempotente).
 */
export function logoutHandler(deps: LogoutHandlerDeps) {
  return async function handle(): Promise<Response> {
    const response = new Response(null, {
      status: 204,
      headers: { 'Cache-Control': 'no-store' },
    });
    response.headers.append('Set-Cookie', buildClearedSessionCookie(deps.secureCookies));
    return response;
  };
}
