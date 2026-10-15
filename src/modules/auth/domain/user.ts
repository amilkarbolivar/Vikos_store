/**
 * Entidad `AdminUser`: una persona autorizada a entrar al panel /admin.
 *
 * Solo guarda el HASH de la contraseña, nunca la contraseña. Dominio puro: no
 * depende de Prisma ni de Next.js.
 *
 * Los clientes de la tienda NO son usuarios del sistema; la tienda pública no
 * requiere cuenta. Por eso solo existe este tipo de usuario.
 */

import { ValidationError } from "../../shared/domain/errors.ts";

export const EMAIL_MAX_LENGTH = 254;

export interface AdminUser {
  id: string;
  email: string;
  /** Resultado de `PasswordHasher.hash`. Nunca se envía al navegador. */
  passwordHash: string;
  /** Un administrador desactivado no puede iniciar sesión ni usar sesiones vigentes. */
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Datos del administrador autenticado que se pueden mostrar o pasar a otras capas. */
export interface AuthenticatedAdmin {
  id: string;
  email: string;
}

/**
 * Normaliza un correo: sin espacios y en minúsculas, para que
 * "Admin@Tienda.com " y "admin@tienda.com" sean el mismo usuario.
 * La verificación es básica a propósito; la prueba real de que un correo
 * existe es enviarle un mensaje.
 *
 * @throws ValidationError si no parece un correo.
 */
export function normalizeEmail(raw: string): string {
  const email = raw.trim().toLowerCase();
  const looksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!looksValid || email.length > EMAIL_MAX_LENGTH) {
    throw new ValidationError("El correo no es válido.", "email");
  }
  return email;
}
