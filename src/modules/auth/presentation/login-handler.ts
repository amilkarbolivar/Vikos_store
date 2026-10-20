import { readJsonBody } from '../../shared/presentation/read-json-body';
import { toErrorResponse, type ErrorLogger } from '../../shared/presentation/http-error-mapper';
import type { LoginInput, LoginResult } from '../application/login';
import { parseLoginBody } from './login-request';
import { buildSessionCookie } from './session-cookie';

export interface LoginHandlerDeps {
  login: { execute(input: LoginInput): Promise<LoginResult> };
  /** Marca la cookie como `Secure` (true en producción). */
  secureCookies: boolean;
  logger?: ErrorLogger;
}

/**
 * Adaptador HTTP de POST /api/auth/login.
 * Responde 200 con el administrador y fija la cookie de sesión (HttpOnly). El token NUNCA va en
 * el cuerpo: así el JavaScript de la página no puede leerlo ni guardarlo en un lugar inseguro.
 *
 * Pendiente (ya anotado en `Login`): limitar intentos por IP/correo (rate limiting).
 */
export function loginHandler(deps: LoginHandlerDeps) {
  const logger = deps.logger ?? console;

  return async function handle(request: Request): Promise<Response> {
    try {
      const input = parseLoginBody(await readJsonBody(request));
      const { admin, session } = await deps.login.execute(input);

      const response = Response.json(
        { id: admin.id, email: admin.email },
        { headers: { 'Cache-Control': 'no-store' } },
      );
      response.headers.append(
        'Set-Cookie',
        buildSessionCookie(session.token, session.expiresAt, deps.secureCookies),
      );
      return response;
    } catch (error) {
      return toErrorResponse(error, logger, { context: 'autenticación' });
    }
  };
}
