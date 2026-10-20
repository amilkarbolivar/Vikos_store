/**
 * Adaptador entre la tabla REAL `users` de Prisma (snake_case, con columna `role`) y el
 * `AdminUserDelegate` que espera `PrismaAuthRepository`.
 *
 * Solo se consideran usuarios con `role = 'ADMIN'`: cualquier otro rol se trata como si no
 * existiera, de modo que no pueda iniciar sesión en el panel.
 */

import type { PrismaClient } from "@prisma/client";

import type { AdminUserDelegate, AdminUserRow } from "./auth-repository-impl.ts";

interface UsersRecord {
  id: string;
  email: string;
  password_hash: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

function toRow(record: UsersRecord): AdminUserRow {
  return {
    id: record.id,
    email: record.email,
    passwordHash: record.password_hash,
    isActive: record.is_active,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

export function createAdminUserDelegate(prisma: PrismaClient): AdminUserDelegate {
  return {
    async findUnique({ where }) {
      const record = await prisma.users.findFirst({ where: { ...where, role: "ADMIN" } });
      return record ? toRow(record) : null;
    },
  };
}
