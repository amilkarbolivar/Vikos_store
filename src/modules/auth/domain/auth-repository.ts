/**
 * Contrato de persistencia de administradores.
 *
 * La implementación concreta (Prisma sobre PostgreSQL) llegará cuando la base de
 * datos esté lista en Docker. Los casos de uso dependen solo de esta interfaz.
 */

import type { AdminUser } from "./user.ts";

export interface AuthRepository {
  /** `email` ya normalizado (ver `normalizeEmail`). */
  findAdminByEmail(email: string): Promise<AdminUser | null>;
  findAdminById(id: string): Promise<AdminUser | null>;
}
