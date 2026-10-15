/**
 * Caso de uso: iniciar sesión como administrador.
 *
 * Decisiones de seguridad:
 *  1. Mensaje único: ante correo inexistente, contraseña errónea, usuario
 *     inactivo o datos mal formados se lanza el MISMO `UnauthorizedError`. Así no
 *     se puede averiguar qué correos existen (enumeración de usuarios).
 *  2. Tiempo parejo: si el usuario no existe se calcula igualmente un hash. Sin
 *     esto, responder más rápido delataría que el correo no está registrado.
 *  3. Límite de longitud: contraseñas gigantes se rechazan antes de gastar CPU
 *     en el algoritmo (evita un ataque de denegación de servicio).
 *
 * Pendiente (Fase 4/5): limitar intentos por IP/correo (rate limiting) en la
 * ruta de login; eso pertenece a la capa de presentación.
 */

import { UnauthorizedError } from "../../shared/domain/errors.ts";
import type { AuthRepository } from "../domain/auth-repository.ts";
import type { PasswordHasher } from "../domain/password-hasher.ts";
import type { SessionService, CreatedSession } from "../domain/session-service.ts";
import { normalizeEmail, type AuthenticatedAdmin } from "../domain/user.ts";

export const PASSWORD_MAX_LENGTH = 1024;

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResult {
  admin: AuthenticatedAdmin;
  session: CreatedSession;
}

export class Login {
  private readonly auth: AuthRepository;
  private readonly hasher: PasswordHasher;
  private readonly sessions: SessionService;

  constructor(deps: { auth: AuthRepository; hasher: PasswordHasher; sessions: SessionService }) {
    this.auth = deps.auth;
    this.hasher = deps.hasher;
    this.sessions = deps.sessions;
  }

  /** @throws UnauthorizedError ante cualquier fallo de credenciales. */
  async execute(input: LoginInput): Promise<LoginResult> {
    const user = await this.findCandidate(input.email);
    const passwordOk = await this.checkPassword(input.password, user?.passwordHash);

    if (!user || !user.isActive || !passwordOk) {
      throw new UnauthorizedError("Credenciales inválidas.");
    }

    const session = await this.sessions.create(user.id);
    return { admin: { id: user.id, email: user.email }, session };
  }

  private async findCandidate(rawEmail: string) {
    try {
      return await this.auth.findAdminByEmail(normalizeEmail(rawEmail));
    } catch {
      // Correo mal formado: se trata igual que "no existe".
      return null;
    }
  }

  private async checkPassword(password: string, storedHash: string | undefined): Promise<boolean> {
    if (password.length === 0 || password.length > PASSWORD_MAX_LENGTH) {
      return false;
    }
    if (storedHash === undefined) {
      // Gasta el mismo tiempo que una verificación real y descarta el resultado.
      await this.hasher.hash(password);
      return false;
    }
    return this.hasher.verify(password, storedHash);
  }
}
