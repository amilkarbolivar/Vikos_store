/**
 * ============================================================================
 * CLIENTE HTTP DE LA API
 * ============================================================================
 * Único lugar del frontend que llama a `fetch` hacia nuestros endpoints /api/*.
 * Las páginas NUNCA llaman a fetch directamente: usan `services/catalog-service`,
 * que a su vez usa este cliente. Así, si la API cambia de dirección o de formato de
 * error, se arregla en un solo archivo.
 *
 * Se ejecuta SOLO en el servidor (Server Components).
 */

/** Error que lanzamos cuando la API responde mal o no se puede contactar. */
export class ApiError extends Error {
  /** Código HTTP (404, 500...). Vale 0 si ni siquiera hubo respuesta (API caída). */
  readonly status: number;
  /** Código de error de negocio que envía la API (ej. "PRODUCT_NOT_FOUND"), si lo hay. */
  readonly code: string | undefined;

  constructor(status: number, code: string | undefined, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

/**
 * Dirección base de la API.
 *
 * La API vive en este mismo proyecto Next.js, así que por defecto el servidor se llama a
 * sí mismo (`localhost` + el puerto en el que corre). Si algún día la API se separa a otro
 * servidor, basta con definir la variable de entorno API_BASE_URL.
 */
function getApiBaseUrl(): string {
  const fromEnv = process.env.API_BASE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

/** Forma de los errores que devuelve nuestra API: { error: { code, message } }. */
interface ApiErrorBody {
  error?: { code?: string; message?: string };
}

/**
 * GET a la API que devuelve el JSON tipado.
 *
 * @throws ApiError si la respuesta no es 2xx o si no se pudo contactar la API.
 */
export async function apiGet<T>(path: string): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      headers: { Accept: "application/json" },
      // La tienda debe mostrar siempre lo último que se guardó en el panel de administración,
      // por eso no se guarda copia de las respuestas.
      cache: "no-store",
    });
  } catch {
    // fetch solo lanza cuando no hay conexión (API caída, DNS, etc.).
    throw new ApiError(0, "NETWORK_ERROR", "No se pudo conectar con el servidor.");
  }

  if (!response.ok) {
    // Intentamos leer el mensaje que envía la API; si el cuerpo no es JSON, seguimos igual.
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    throw new ApiError(
      response.status,
      body?.error?.code,
      body?.error?.message ?? `La API respondió con el estado ${response.status}.`,
    );
  }

  return (await response.json()) as T;
}

/**
 * Igual que `apiGet`, pero un 404 se convierte en `null` en lugar de un error.
 * Es lo que queremos cuando el recurso "puede no existir" (por ejemplo, un producto
 * cuyo enlace se escribió mal): la página decide mostrar su pantalla de "no encontrado".
 */
export async function apiGetOrNull<T>(path: string): Promise<T | null> {
  try {
    return await apiGet<T>(path);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
