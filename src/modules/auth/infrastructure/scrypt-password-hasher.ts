/**
 * Implementación de `PasswordHasher` con scrypt, incluido en `node:crypto`.
 *
 * ¿Por qué scrypt?
 *  - No es criptografía inventada: es un algoritmo estándar (RFC 7914) pensado
 *    para contraseñas, deliberadamente lento y costoso en memoria.
 *  - Viene con Node, así que no añade dependencias nativas que compilar en Docker.
 *  - Los parámetros por defecto (N=2^17, r=8, p=1) son los mínimos que recomienda
 *    OWASP para scrypt. Si más adelante prefieres argon2id, solo hay que crear
 *    otra clase que cumpla `PasswordHasher`.
 *
 * Formato guardado: `scrypt$N$r$p$sal(base64)$hash(base64)`. Al llevar los
 * parámetros dentro, se pueden endurecer en el futuro sin invalidar hashes viejos.
 *
 * Solo funciona en el runtime Node.js de Next.js (no en Edge).
 */

import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";

import type { PasswordHasher } from "../domain/password-hasher.ts";

export interface ScryptParams {
  /** Costo de CPU/memoria. Potencia de 2. */
  N: number;
  r: number;
  p: number;
}

export const DEFAULT_SCRYPT_PARAMS: ScryptParams = { N: 2 ** 17, r: 8, p: 1 };

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

function derive(password: string, salt: Buffer, params: ScryptParams): Promise<Buffer> {
  // scrypt exige maxmem > 128 * N * r; se deja el doble de margen.
  const options: ScryptOptions = { N: params.N, r: params.r, p: params.p, maxmem: 256 * params.N * params.r };
  return new Promise((resolve, reject) => {
    scrypt(password.normalize("NFKC"), salt, KEY_LENGTH, options, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

export class ScryptPasswordHasher implements PasswordHasher {
  private readonly params: ScryptParams;

  /** @param params Solo cámbialos en pruebas (costo bajo); en producción usa los de por defecto. */
  constructor(params: ScryptParams = DEFAULT_SCRYPT_PARAMS) {
    this.params = params;
  }

  async hash(plainPassword: string): Promise<string> {
    const salt = randomBytes(SALT_LENGTH);
    const key = await derive(plainPassword, salt, this.params);
    const { N, r, p } = this.params;
    return `scrypt$${N}$${r}$${p}$${salt.toString("base64")}$${key.toString("base64")}`;
  }

  async verify(plainPassword: string, storedHash: string): Promise<boolean> {
    const parts = storedHash.split("$");
    if (parts.length !== 6 || parts[0] !== "scrypt") return false;

    const [, nRaw, rRaw, pRaw, saltB64, keyB64] = parts as [string, string, string, string, string, string];
    const params: ScryptParams = { N: Number(nRaw), r: Number(rRaw), p: Number(pRaw) };
    const valid = [params.N, params.r, params.p].every((n) => Number.isInteger(n) && n > 0);
    if (!valid) return false;

    const expected = Buffer.from(keyB64, "base64");
    if (expected.length !== KEY_LENGTH) return false;

    try {
      const actual = await derive(plainPassword, Buffer.from(saltB64, "base64"), params);
      return timingSafeEqual(actual, expected); // comparación en tiempo constante
    } catch {
      return false;
    }
  }
}
