/**
 * ============================================================================
 * CLIENTE HTTP DEL PANEL (en el navegador)
 * ============================================================================
 * Envía las acciones del administrador (crear, editar, ocultar, eliminar, iniciar y cerrar
 * sesión) a nuestros endpoints /api/*. Corre en el NAVEGADOR (desde componentes de cliente),
 * por eso usa rutas relativas y el navegador adjunta la cookie de sesión por sí solo.
 *
 * Traduce las respuestas de error de la API a un `AdminApiError` con:
 *   - `message`: texto en español listo para mostrar,
 *   - `fieldErrors`: el error de cada campo (para pintarlo junto al campo del formulario).
 */

/** Errores por campo: { price: "El precio debe ser mayor que cero", ... }. */
export type FieldErrors = Record<string, string>;

/** Forma de los errores que devuelve nuestra API. */
interface ApiErrorBody {
  error?: {
    code?: string;
    message?: string;
    details?: Array<{ field?: string; message?: string }>;
  };
}

export class AdminApiError extends Error {
  readonly status: number;
  readonly code: string | undefined;
  readonly fieldErrors: FieldErrors;

  constructor(status: number, code: string | undefined, message: string, fieldErrors: FieldErrors = {}) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }

  /** `true` si la sesión venció o no existe (hay que volver a iniciar sesión). */
  get isSessionExpired(): boolean {
    return this.status === 401;
  }
}

/** Mensaje en español según el código HTTP, cuando la API no trae uno propio útil. */
function fallbackMessage(status: number): string {
  if (status === 401) return "Tu sesión expiró. Inicia sesión de nuevo.";
  if (status === 403) return "No tienes permiso para hacer esto.";
  if (status === 404) return "Este elemento ya no existe. Recarga la página.";
  if (status === 413) return "Los datos enviados son demasiado grandes.";
  if (status >= 500) return "Ocurrió un error en el servidor. Inténtalo de nuevo en unos segundos.";
  return "No se pudo completar la acción.";
}

/** Convierte el cuerpo de error de la API en un AdminApiError. */
export function toAdminApiError(status: number, body: unknown): AdminApiError {
  const error = (body as ApiErrorBody | null)?.error;
  const fieldErrors: FieldErrors = {};

  for (const detail of error?.details ?? []) {
    // El detalle "body" no es de un campo concreto: se muestra como mensaje general.
    if (detail.field && detail.field !== "body" && detail.message && !fieldErrors[detail.field]) {
      fieldErrors[detail.field] = detail.message;
    }
  }

  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  // Errores de validación: la API envía un texto genérico; lo importante está en cada campo.
  // Errores 5xx: nunca mostramos el texto del servidor tal cual.
  const message =
    status === 400 && hasFieldErrors
      ? "Revisa los campos marcados."
      : status >= 500 || status === 401
        ? fallbackMessage(status)
        : (error?.message ?? fallbackMessage(status));

  return new AdminApiError(status, error?.code, message, fieldErrors);
}

type Method = "POST" | "PATCH" | "DELETE";

/**
 * Hace una petición con cuerpo JSON opcional y devuelve el JSON de la respuesta
 * (o `undefined` si la API respondió 204 sin cuerpo).
 *
 * @throws AdminApiError si la API responde con error o no se pudo conectar.
 */
export async function adminRequest<T = void>(method: Method, path: string, body?: unknown): Promise<T> {
  let response: Response;

  try {
    response = await fetch(path, {
      method,
      credentials: "same-origin",
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new AdminApiError(0, "NETWORK_ERROR", "No se pudo conectar con el servidor. Revisa tu conexión.");
  }

  if (response.status === 204) return undefined as T;

  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) throw toAdminApiError(response.status, data);
  return data as T;
}
