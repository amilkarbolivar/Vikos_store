import { ProductNotFoundError } from '../domain/errors';
import type { ProductRepository } from '../domain/product-repository';

/**
 * Elimina definitivamente un producto (y sus imágenes, en cascada). Es irreversible: la interfaz
 * de administración debe pedir confirmación. Si otros registros lo referencian (pedidos, cuando
 * existan) el repositorio lanza ConflictError y lo correcto es desactivarlo.
 */
export class DeleteProduct {
  constructor(private readonly products: ProductRepository) {}

  /**
   * @throws ProductNotFoundError si no existe.
   * @throws ConflictError si otros registros lo referencian.
   */
  async execute(id: string): Promise<void> {
    const current = await this.products.findById(id);
    if (!current) throw new ProductNotFoundError();
    await this.products.delete(id);
  }
}
