/**
 * Caso de uso: eliminar definitivamente un producto.
 *
 * Es destructivo e irreversible, por eso es un caso de uso distinto de
 * `DeactivateProduct`. La interfaz de administración debe pedir confirmación.
 *
 * Cuando se implementen los pedidos, `OrderItem` referenciará a `Product` con
 * `onDelete: Restrict`: PostgreSQL impedirá borrar un producto vendido, y el
 * repositorio lo traducirá a `ConflictError`. En ese caso la acción correcta es
 * desactivarlo. No se borra en cascada para no destruir el historial de ventas.
 */

import { NotFoundError } from "../../shared/domain/errors.ts";
import type { ProductRepository } from "../domain/product-repository.ts";

export class DeleteProduct {
  private readonly products: ProductRepository;

  constructor(deps: { products: ProductRepository }) {
    this.products = deps.products;
  }

  /**
   * @throws NotFoundError si el producto no existe.
   * @throws ConflictError si otros registros lo referencian.
   */
  async execute(id: string): Promise<void> {
    const current = await this.products.findById(id);
    if (!current) throw new NotFoundError("Producto", id);
    await this.products.delete(id);
  }
}
