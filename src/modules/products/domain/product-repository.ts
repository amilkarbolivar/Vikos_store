/**
 * Contrato de persistencia de productos.
 *
 * El dominio y los casos de uso dependen de esta abstracción; la implementación
 * con Prisma (`PrismaProductRepository`, Fase 3) vive en `infrastructure`.
 */

import type { NewProduct, Product, ProductChanges } from "./product.ts";

export interface ListProductsOptions {
  /** Filtra por categoría. */
  categoryId?: string;
  /**
   * Vista de la tienda pública: solo productos disponibles (`isAvailable`) CUYA
   * categoría esté activa. Sin esta opción (panel admin) se devuelven todos.
   */
  publicOnly?: boolean;
  /** Búsqueda por texto en el nombre (sin distinguir mayúsculas). */
  search?: string;
}

export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  findAll(options?: ListProductsOptions): Promise<Product[]>;

  /**
   * @throws ConflictError si el slug ya existe (UNIQUE en la base de datos).
   * @throws NotFoundError si `categoryId` no existe (violación de la clave foránea).
   */
  create(data: NewProduct): Promise<Product>;

  /**
   * @throws NotFoundError si el producto (o la nueva categoría) no existe.
   * @throws ConflictError si el nuevo slug ya existe.
   */
  update(id: string, changes: ProductChanges): Promise<Product>;

  /**
   * Borra definitivamente el producto.
   * @throws NotFoundError si no existe.
   * @throws ConflictError si otros registros lo referencian (p. ej. pedidos futuros).
   */
  delete(id: string): Promise<void>;
}
