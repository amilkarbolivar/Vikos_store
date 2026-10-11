/**
 * Caso de uso: listar categorías.
 *
 * - Tienda pública: `execute({ onlyActive: true })`.
 * - Panel administrativo: `execute()` para ver también las inactivas.
 *
 * Quien llama decide el filtro; no se asume por defecto que el visitante es
 * público para no mezclar permisos con consultas.
 */

import type { Category } from "../domain/category.ts";
import type {
  CategoryRepository,
  ListCategoriesOptions,
} from "../domain/category-repository.ts";

export class ListCategories {
  private readonly categories: CategoryRepository;

  constructor(deps: { categories: CategoryRepository }) {
    this.categories = deps.categories;
  }

  async execute(options: ListCategoriesOptions = {}): Promise<Category[]> {
    return this.categories.findAll(options);
  }
}
