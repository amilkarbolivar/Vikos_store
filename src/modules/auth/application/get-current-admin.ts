/**
 * Caso de uso: obtener el administrador de la sesión actual.
 *
 * Es el núcleo del futuro `requireAdmin()` de la capa de presentación. Cada ruta
 * API, Server Action o página bajo /admin debe llamarlo ANTES de hacer algo
 * sensible. Ocultar enlaces o tener una página de login NO protege nada; la
 * protección real es esta verificación en el servidor, en cada operación.
 *
 * Comprueba tres cosas, y falla con el mismo error en todas:
 *  - que haya token,
 *  - que el token sea válido (firma correcta y sin expirar),
 *  - que el usuario siga existiendo y activo (un administrador desactivado pierde
 *    el acceso aunque su sesión no haya expirado).
 */

import { UnauthorizedError } from "../../shared/domain/errors.ts";
import type { AuthRepository } from "../domain/auth-repository.ts";
import type { SessionService } from "../domain/session-service.ts";
import type { AuthenticatedAdmin } from "../domain/user.ts";

export class GetCurrentAdmin {
  private readonly auth: AuthRepository;
  private readonly sessions: SessionService;

  constructor(deps: { auth: AuthRepository; sessions: SessionService }) {
    this.auth = deps.auth;
    this.sessions = deps.sessions;
  }

  /** @param token Valor de la cookie de sesión (o `undefined` si no vino). */
  async execute(token: string | undefined): Promise<AuthenticatedAdmin> {
    if (!token) throw new UnauthorizedError();

    const session = await this.sessions.verify(token);
    if (!session) throw new UnauthorizedError();

    const user = await this.auth.findAdminById(session.userId);
    if (!user || !user.isActive) throw new UnauthorizedError();

    return { id: user.id, email: user.email };
  }
}
