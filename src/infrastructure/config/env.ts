/**
 * Lectura y validación de variables de entorno (solo servidor).
 *
 * ¿Por qué un archivo propio?
 * Leer `process.env.X` suelto por todo el código esconde errores de
 * configuración hasta que algo falla en producción. Aquí se valida UNA vez y el
 * resto del código recibe valores tipados.
 *
 * Seguridad:
 *  - Nada de lo que se lea aquí debe usar el prefijo `NEXT_PUBLIC_`: Next.js
 *    incrusta esas variables en el JavaScript del navegador y cualquiera las vería.
 *  - No importes este archivo desde componentes cliente ("use client").
 *  - Los valores reales van en `.env` (ignorado por git), nunca en el código.
 *
 * `DATABASE_URL` es opcional por ahora: PostgreSQL correrá más adelante en otro
 * contenedor de Docker y solo entonces será obligatoria (`requireDatabaseUrl`).
 */

export type NodeEnv = "development" | "test" | "production";

export interface ServerEnv {
  nodeEnv: NodeEnv;
  /** Cadena de conexión a PostgreSQL. Aún no se usa. */
  databaseUrl: string | undefined;
  /** Secreto para firmar sesiones. Mínimo 32 caracteres. */
  sessionSecret: string | undefined;
}

export const SESSION_SECRET_MIN_LENGTH = 32;

function parseNodeEnv(raw: string | undefined): NodeEnv {
  return raw === "production" || raw === "test" ? raw : "development";
}

/**
 * Convierte un objeto de variables (normalmente `process.env`) en `ServerEnv`.
 * Recibe el objeto por parámetro para poder probarla sin tocar el entorno real.
 *
 * @throws Error si `SESSION_SECRET` existe pero es demasiado corto, o si falta
 *         en producción.
 */
export function parseEnv(source: Record<string, string | undefined>): ServerEnv {
  const nodeEnv = parseNodeEnv(source["NODE_ENV"]);
  const sessionSecret = source["SESSION_SECRET"]?.trim() || undefined;
  const databaseUrl = source["DATABASE_URL"]?.trim() || undefined;

  if (sessionSecret !== undefined && sessionSecret.length < SESSION_SECRET_MIN_LENGTH) {
    throw new Error(
      `SESSION_SECRET debe tener al menos ${SESSION_SECRET_MIN_LENGTH} caracteres.`,
    );
  }
  if (nodeEnv === "production" && sessionSecret === undefined) {
    throw new Error("SESSION_SECRET es obligatoria en producción.");
  }

  return { nodeEnv, databaseUrl, sessionSecret };
}

let cached: ServerEnv | undefined;

/** Entorno del proceso actual, validado una sola vez. */
export function getServerEnv(): ServerEnv {
  cached ??= parseEnv(process.env);
  return cached;
}

/** Devuelve el secreto de sesión o falla con un mensaje claro si no está configurado. */
export function requireSessionSecret(env: ServerEnv = getServerEnv()): string {
  if (env.sessionSecret === undefined) {
    throw new Error("Falta SESSION_SECRET. Define una cadena aleatoria de 32+ caracteres en .env.");
  }
  return env.sessionSecret;
}

/** Devuelve la URL de la base de datos o falla si todavía no se configuró. */
export function requireDatabaseUrl(env: ServerEnv = getServerEnv()): string {
  if (env.databaseUrl === undefined) {
    throw new Error("Falta DATABASE_URL (la base de datos aún no está configurada).");
  }
  return env.databaseUrl;
}
