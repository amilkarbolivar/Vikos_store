/**
 * Cookie de sesión del panel de administración.
 *
 *  - HttpOnly: el JavaScript del navegador no puede leerla (mitiga el robo por XSS).
 *  - SameSite=Strict: el navegador no la envía en peticiones originadas en otros sitios
 *    (mitiga CSRF en las rutas que modifican datos).
 *  - Secure: solo por HTTPS; se activa en producción (en desarrollo se usa http://localhost).
 */

export const SESSION_COOKIE_NAME = "vikos_session";

/** Lee el token de sesión del encabezado `Cookie` de la petición. */
export function readSessionToken(request: Request): string | undefined {
  const header = request.headers.get("cookie");
  if (!header) return undefined;

  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator === -1) continue;
    if (part.slice(0, separator).trim() === SESSION_COOKIE_NAME) {
      const value = part.slice(separator + 1).trim();
      return value || undefined;
    }
  }
  return undefined;
}

function attributes(secure: boolean): string[] {
  return ["Path=/", "HttpOnly", "SameSite=Strict", ...(secure ? ["Secure"] : [])];
}

export function buildSessionCookie(token: string, expiresAt: Date, secure: boolean): string {
  return [
    `${SESSION_COOKIE_NAME}=${token}`,
    ...attributes(secure),
    `Expires=${expiresAt.toUTCString()}`,
  ].join("; ");
}

export function buildClearedSessionCookie(secure: boolean): string {
  return [
    `${SESSION_COOKIE_NAME}=`,
    ...attributes(secure),
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
  ].join("; ");
}

export function shouldUseSecureCookies(): boolean {
  return process.env.NODE_ENV === "production";
}
