/**
 * Extrae el código de error de Prisma (`P2002`, `P2025`, ...) de un error desconocido.
 * Devuelve `undefined` si no es un error de Prisma (por ejemplo `ECONNRESET` o un `Error` común).
 */
export function getPrismaErrorCode(error: unknown): string | undefined {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const { code } = error as { code: unknown };
    if (typeof code === 'string' && /^P\d{4}$/.test(code)) return code;
  }
  return undefined;
}
