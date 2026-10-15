/**
 * Puerto para crear y verificar sesiones.
 *
 * Es un puerto porque el mecanismo (JWT firmado con `jose`, sesiones en base de
 * datos, etc.) es un detalle técnico. Los casos de uso solo piden: "créame una
 * sesión para este usuario" y "dime de quién es esta sesión".
 *
 * La implementación con cookies seguras (httpOnly, secure, sameSite) se escribe
 * en la capa de presentación/infraestructura de Next.js.
 */

export interface CreatedSession {
  /** Valor opaco que se guardará en la cookie. */
  token: string;
  expiresAt: Date;
}

export interface SessionService {
  create(userId: string): Promise<CreatedSession>;
  /** Devuelve el id del usuario, o `null` si el token es inválido, alterado o expiró. */
  verify(token: string): Promise<{ userId: string } | null>;
}
