/**
 * Adaptador entre el modelo REAL de Prisma (`categories`, columnas en snake_case) y el
 * `CategoryDelegate` que espera `PrismaCategoryRepository` (camelCase).
 *
 * Dos detalles del esquema que justifican esta capa:
 *  - `updated_at` no tiene `@updatedAt`, así que Prisma no lo actualiza solo: se escribe aquí.
 *  - Las columnas `image_url` y `parent_id` aún no forman parte del dominio y se ignoran.
 */

import type { PrismaClient } from '@prisma/client';

import type { CategoryDelegate, CategoryRow } from './category-repository-impl';

/** Lo mínimo que se lee de la fila de Prisma. */
interface CategoriesRecord {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

function toRow(record: CategoriesRecord): CategoryRow {
  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    description: record.description,
    isActive: record.is_active,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

export function createCategoryDelegate(prisma: PrismaClient): CategoryDelegate {
  const db = prisma.categories;

  return {
    async findUnique({ where }) {
      const record = await db.findUnique({ where });
      return record ? toRow(record) : null;
    },

    async findMany({ where, orderBy }) {
      const records = await db.findMany({
        ...(where?.isActive !== undefined ? { where: { is_active: where.isActive } } : {}),
        orderBy,
      });
      return records.map(toRow);
    },

    async create({ data }) {
      const record = await db.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          is_active: data.isActive,
        },
      });
      return toRow(record);
    },

    async update({ where, data }) {
      const record = await db.update({
        where,
        data: {
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.slug !== undefined ? { slug: data.slug } : {}),
          ...(data.description !== undefined ? { description: data.description } : {}),
          ...(data.isActive !== undefined ? { is_active: data.isActive } : {}),
          updated_at: new Date(),
        },
      });
      return toRow(record);
    },
  };
}
