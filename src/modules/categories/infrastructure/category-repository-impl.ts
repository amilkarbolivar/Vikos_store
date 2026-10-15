/**
 * Implementación de `CategoryRepository` con Prisma (PostgreSQL).
 *
 * Responsabilidades de esta capa:
 *  1. Traducir entre filas de la base de datos y la entidad `Category` del dominio.
 *  2. Traducir errores técnicos de Prisma a errores del dominio, para que los casos
 *     de uso y la interfaz nunca vean detalles de la base de datos:
 *       P2002 (UNIQUE)  -> ConflictError  (slug repetido, incluso con peticiones simultáneas)
 *       P2025 (no existe) -> NotFoundError
 *     Cualquier otro error se relanza tal cual (es un fallo real, no de negocio).
 *
 * El repositorio recibe un "delegado" mínimo (`CategoryDelegate`) en lugar de todo
 * el `PrismaClient`: declara exactamente qué consultas usa y permite probarlo con
 * un delegado falso. En producción se le pasa `getPrisma().category`.
 */

import { getPrismaErrorCode } from "../../../infrastructure/database/prisma-errors.ts";
import { ConflictError, NotFoundError } from "../../shared/domain/errors.ts";
import type { Category, CategoryChanges, NewCategory } from "../domain/category.ts";
import type {
  CategoryRepository,
  ListCategoriesOptions,
} from "../domain/category-repository.ts";

/** Fila tal como la devuelve Prisma para el modelo `Category`. */
export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Subconjunto de `prisma.category` que usa este repositorio. */
export interface CategoryDelegate {
  findUnique(args: { where: { id: string } | { slug: string } }): Promise<CategoryRow | null>;
  findMany(args: { where?: { isActive?: boolean }; orderBy: { name: "asc" } }): Promise<CategoryRow[]>;
  create(args: { data: NewCategory }): Promise<CategoryRow>;
  update(args: { where: { id: string }; data: CategoryChanges }): Promise<CategoryRow>;
}

/** Copia solo los campos del dominio (no deja pasar relaciones ni campos extra). */
function toCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class PrismaCategoryRepository implements CategoryRepository {
  private readonly db: CategoryDelegate;

  constructor(db: CategoryDelegate) {
    this.db = db;
  }

  async findById(id: string): Promise<Category | null> {
    const row = await this.db.findUnique({ where: { id } });
    return row ? toCategory(row) : null;
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const row = await this.db.findUnique({ where: { slug } });
    return row ? toCategory(row) : null;
  }

  async findAll(options: ListCategoriesOptions = {}): Promise<Category[]> {
    const rows = await this.db.findMany({
      ...(options.onlyActive ? { where: { isActive: true } } : {}),
      orderBy: { name: "asc" },
    });
    return rows.map(toCategory);
  }

  async create(data: NewCategory): Promise<Category> {
    try {
      return toCategory(await this.db.create({ data }));
    } catch (error) {
      if (getPrismaErrorCode(error) === "P2002") {
        throw new ConflictError(`Ya existe una categoría con el slug "${data.slug}".`);
      }
      throw error;
    }
  }

  async update(id: string, changes: CategoryChanges): Promise<Category> {
    try {
      return toCategory(await this.db.update({ where: { id }, data: changes }));
    } catch (error) {
      const code = getPrismaErrorCode(error);
      if (code === "P2025") throw new NotFoundError("Categoría", id);
      if (code === "P2002") throw new ConflictError("Ya existe una categoría con ese slug.");
      throw error;
    }
  }
}
