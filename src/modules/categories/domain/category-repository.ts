/**
 * Contrato de persistencia de categorías.
 *
 * Inversión de dependencias: los casos de uso (capa `application`) dependen de
 * ESTA interfaz, no de Prisma. La implementación concreta
 * (`PrismaCategoryRepository`, Fase 3) vive en `infrastructure` y se inyecta
 * desde fuera. Gracias a esto las pruebas unitarias usan un repositorio en
 * memoria y no necesitan base de datos.
 */

import type { Category, CategoryChanges, NewCategory } from "./category.ts";

export interface ListCategoriesOptions {
  /** Si es `true`, solo devuelve categorías activas (uso típico: la tienda pública). */
  onlyActive?: boolean;
}

export interface CategoryRepository {
  findById(id: string): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
  findAll(options?: ListCategoriesOptions): Promise<Category[]>;

  /**
   * Guarda una categoría nueva y devuelve la entidad con id y fechas.
   * @throws ConflictError si el slug ya existe (la restricción UNIQUE de la base
   *         de datos es la garantía final, incluso ante peticiones concurrentes).
   */
  create(data: NewCategory): Promise<Category>;

  /**
   * Aplica cambios parciales.
   * @throws NotFoundError si la categoría no existe.
   * @throws ConflictError si el nuevo slug ya existe.
   */
  update(id: string, changes: CategoryChanges): Promise<Category>;
}
