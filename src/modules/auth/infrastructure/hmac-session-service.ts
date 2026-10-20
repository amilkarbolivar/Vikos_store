/**
 * Implementación de `SessionService` con tokens firmados con HMAC-SHA256 (solo `node:crypto`,
 * sin dependencias nuevas).
 *
 * Formato del token: `base64url(payload).base64url(firma)`, con payload `{ sub, exp }`
 * (`exp` en segundos Unix). La firma cubre el payload completo, así que no se puede cambiar el
 * usuario ni la expiración sin conocer `SESSION_SECRET`. La firma se compara en tiempo constante.
 *
 * Limitación conocida: es una sesión "sin estado"; no se puede revocar un token concreto antes
 * de que expire. Mitigación: `GetCurrentAdmin` consulta el usuario en cada petición, así que
 * desactivar a un administrador corta su acceso de inmediato, y la duración es corta.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

import type { CreatedSession, SessionService } from "../domain/session-service.ts";

export const DEFAULT_SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 horas

export interface HmacSessionServiceOptions {
  /** Secreto de firma (`SESSION_SECRET`, mínimo 32 caracteres). */
  secret: string;
  ttlMs?: number;
  /** Reloj inyectable para las pruebas. */
  now?: () => number;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

export class HmacSessionService implements SessionService {
  private readonly secret: string;
  private readonly ttlMs: number;
  private readonly now: () => number;

  constructor(options: HmacSessionServiceOptions) {
    this.secret = options.secret;
    this.ttlMs = options.ttlMs ?? DEFAULT_SESSION_TTL_MS;
    this.now = options.now ?? Date.now;
  }

  async create(userId: string): Promise<CreatedSession> {
    const expiresAt = new Date(this.now() + this.ttlMs);
    const payload = base64url(
      JSON.stringify({ sub: userId, exp: Math.floor(expiresAt.getTime() / 1000) }),
    );
    return { token: `${payload}.${this.sign(payload)}`, expiresAt };
  }

  async verify(token: string): Promise<{ userId: string } | null> {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [payload, signature] = parts as [string, string];

    const expected = Buffer.from(this.sign(payload));
    const received = Buffer.from(signature);
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

    try {
      const claims: unknown = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
      if (typeof claims !== "object" || claims === null) return null;
      const { sub, exp } = claims as { sub?: unknown; exp?: unknown };
      if (typeof sub !== "string" || typeof exp !== "number") return null;
      if (exp * 1000 <= this.now()) return null;
      return { userId: sub };
    } catch {
      return null;
    }
  }

  private sign(payload: string): string {
    return createHmac("sha256", this.secret).update(payload).digest("base64url");
  }
}
