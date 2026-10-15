import type { Prisma, PrismaClient } from '@prisma/client';

import { AppError, InfrastructureError } from '../../shared/domain/errors';
import { centsToDecimalString, decimalStringToCents } from '../../shared/domain/money';
import {
  CategoryNotFoundError,
  DuplicateSkuError,
  DuplicateSlugError,
  ProductNotFoundError,
} from '../domain/errors';
import type { NewProduct, Product } from '../domain/product';
import type {
  ProductChanges,
  ProductListFilter,
  ProductRepository,
} from '../domain/product-repository';

/**
 * Solo se carga la imagen principal (o, si no hay, la primera por posición):
 * el dominio expone una única `imageUrl`.
 */
const productInclude = {
  product_images: {
    orderBy: [{ is_primary: 'desc' }, { position: 'asc' }],
    take: 1,
  },
} satisfies Prisma.ProductInclude;

type ProductRow = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

function toDomain(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? '',
    priceInCents: decimalStringToCents(row.price.toString()),
    categoryId: row.categoryId,
    imageUrl: row.product_images[0]?.image_url ?? null,
    isAvailable: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class ProductRepositoryImpl implements ProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Product | null> {
    try {
      const row = await this.prisma.product.findUnique({
        where: { id },
        include: productInclude,
      });
      return row ? toDomain(row) : null;
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async findBySlug(slug: string): Promise<Product | null> {
    try {
      const row = await this.prisma.product.findUnique({
        where: { slug },
        include: productInclude,
      });
      return row ? toDomain(row) : null;
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async list(filter: ProductListFilter = {}): Promise<Product[]> {
    try {
      const rows = await this.prisma.product.findMany({
        where: {
          ...(filter.categoryId ? { categoryId: filter.categoryId } : {}),
          ...(filter.onlyAvailable ? { isActive: true } : {}),
        },
        include: productInclude,
        orderBy: { createdAt: 'desc' },
      });
      return rows.map(toDomain);
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  /**
   * Crea el producto y su imagen principal en una sola operación:
   * Prisma ejecuta el `create` anidado dentro de una transacción, así que no puede
   * quedar un producto guardado sin su imagen (ni al revés).
   */
  async create(data: NewProduct): Promise<Product> {
    try {
      const row = await this.prisma.product.create({
        data: {
          categoryId: data.categoryId,
          name: data.name,
          slug: data.slug,
          description: data.description === '' ? null : data.description,
          price: centsToDecimalString(data.priceInCents),
          isActive: data.isAvailable,
          ...(data.imageUrl
            ? {
                product_images: {
                  create: {
                    image_url: data.imageUrl,
                    alt_text: data.name,
                    position: 0,
                    is_primary: true,
                  },
                },
              }
            : {}),
        },
        include: productInclude,
      });
      return toDomain(row);
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async update(id: string, changes: ProductChanges): Promise<Product> {
    const data: Prisma.ProductUncheckedUpdateInput = {};

    if (changes.name !== undefined) data.name = changes.name;
    if (changes.slug !== undefined) data.slug = changes.slug;
    if (changes.description !== undefined) {
      data.description = changes.description === '' ? null : changes.description;
    }
    if (changes.priceInCents !== undefined) {
      data.price = centsToDecimalString(changes.priceInCents);
    }
    if (changes.categoryId !== undefined) data.categoryId = changes.categoryId;
    if (changes.isAvailable !== undefined) data.isActive = changes.isAvailable;
    if (changes.imageUrl !== undefined) {
      data.product_images =
        changes.imageUrl === null
          ? { deleteMany: {} }
          : {
              deleteMany: {},
              create: {
                image_url: changes.imageUrl,
                alt_text: changes.name ?? null,
                position: 0,
                is_primary: true,
              },
            };
    }

    try {
      const row = await this.prisma.product.update({
        where: { id },
        data,
        include: productInclude,
      });
      return toDomain(row);
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      // product_images se elimina en cascada (ON DELETE CASCADE en la base de datos)
      await this.prisma.product.delete({ where: { id } });
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
}

/**
 * Traduce errores de Prisma/PostgreSQL a errores del dominio.
 * Lo que no se reconoce se envuelve en InfrastructureError SIN copiar el mensaje original
 * (puede contener nombres de tablas, hosts o fragmentos de consulta); la causa queda en `cause`.
 */
export function translatePrismaError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  const code = readPrismaCode(error);
  const meta = readPrismaMeta(error);

  switch (code) {
    case 'P2002': // violación de unicidad
      if (meta.includes('slug')) return new DuplicateSlugError();
      if (meta.includes('sku')) return new DuplicateSkuError();
      return new InfrastructureError('Se violó una restricción de unicidad', { cause: error });
    case 'P2003': // violación de clave foránea: la categoría dejó de existir
      return new CategoryNotFoundError();
    case 'P2025': // registro no encontrado
      return new ProductNotFoundError();
    default:
      return new InfrastructureError('Error al acceder a la base de datos', { cause: error });
  }
}

function readPrismaCode(error: unknown): string | undefined {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const { code } = error as { code: unknown };
    if (typeof code === 'string') return code;
  }
  return undefined;
}

/** `meta` cambia de forma según el motor/adaptador; se busca el nombre de la columna en su texto. */
function readPrismaMeta(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'meta' in error) {
    try {
      return JSON.stringify((error as { meta: unknown }).meta ?? {}).toLowerCase();
    } catch {
      return '';
    }
  }
  return '';
}
