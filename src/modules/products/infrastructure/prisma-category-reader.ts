import type { PrismaClient } from '@prisma/client';

import { InfrastructureError } from '../../shared/domain/errors';
import type { CategoryReader, CategorySummary } from '../application/create-product';

/**
 * Adaptador mínimo que cumple el puerto `CategoryReader` con Prisma.
 * Si tu módulo de categorías ya tiene un repositorio con `findById` que expone `isActive`,
 * puedes pasarlo a `CreateProduct` en su lugar y borrar este archivo.
 */
export class PrismaCategoryReader implements CategoryReader {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<CategorySummary | null> {
    try {
      const row = await this.prisma.categories.findUnique({
        where: { id },
        select: { id: true, is_active: true },
      });
      return row ? { id: row.id, isActive: row.is_active } : null;
    } catch (error) {
      throw new InfrastructureError('Error al consultar la categoría', { cause: error });
    }
  }
}
