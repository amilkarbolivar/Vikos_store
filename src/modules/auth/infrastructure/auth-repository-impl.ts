/**
 * Implementación de `AuthRepository` con Prisma: consulta administradores.
 *
 * Solo lectura. Los administradores se crean con `npm run db:seed` (prisma/seed.ts),
 * no desde la aplicación web, para que nadie pueda registrarse como administrador.
 */

import type { AuthRepository } from "../domain/auth-repository.ts";
import type { AdminUser } from "../domain/user.ts";

/** Fila tal como la devuelve Prisma para el modelo `AdminUser`. */
export interface AdminUserRow {
  id: string;
  email: string;
  passwordHash: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Subconjunto de `prisma.adminUser` que usa este repositorio. */
export interface AdminUserDelegate {
  findUnique(args: { where: { id: string } | { email: string } }): Promise<AdminUserRow | null>;
}

function toAdminUser(row: AdminUserRow): AdminUser {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.passwordHash,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class PrismaAuthRepository implements AuthRepository {
  private readonly db: AdminUserDelegate;

  constructor(db: AdminUserDelegate) {
    this.db = db;
  }

  async findAdminByEmail(email: string): Promise<AdminUser | null> {
    const row = await this.db.findUnique({ where: { email } });
    return row ? toAdminUser(row) : null;
  }

  async findAdminById(id: string): Promise<AdminUser | null> {
    const row = await this.db.findUnique({ where: { id } });
    return row ? toAdminUser(row) : null;
  }
}
