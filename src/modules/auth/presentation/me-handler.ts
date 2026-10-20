import { toErrorResponse, type ErrorLogger } from '../../shared/presentation/http-error-mapper';
import type { AdminSession } from './require-admin';

export interface MeHandlerDeps {
  requireAdmin: (request: Request) => Promise<AdminSession>;
  logger?: ErrorLogger;
}

/** Adaptador HTTP de GET /api/auth/me: quién es el administrador de la sesión actual (o 401). */
export function meHandler(deps: MeHandlerDeps) {
  const logger = deps.logger ?? console;

  return async function handle(request: Request): Promise<Response> {
    try {
      const session = await deps.requireAdmin(request);
      return Response.json(
        { id: session.userId, email: session.email ?? null, role: session.role },
        { headers: { 'Cache-Control': 'no-store' } },
      );
    } catch (error) {
      return toErrorResponse(error, logger, { context: 'autenticación' });
    }
  };
}
