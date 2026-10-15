import { CategoryInactiveError, CategoryNotFoundError, DuplicateSlugError } from '../domain/errors';
import type { Product } from '../domain/product';
import type { ProductRepository } from '../domain/product-repository';
import { buildNewProduct } from '../domain/product-rules';

export interface CreateProductInput {
  name: string;
  slug?: string;
  description?: string;
  /** Precio en centavos de peso. La API recibe pesos y lo convierte antes de llegar aquí. */
  priceInCents: number;
  categoryId: string;
  imageUrl?: string | null;
  isAvailable?: boolean;
}

export interface CategorySummary {
  id: string;
  isActive: boolean;
}

/**
 * Puerto mínimo que este caso de uso necesita del módulo de categorías.
 * Cualquier repositorio de categorías que tenga `findById` y exponga `isActive` lo cumple.
 */
export interface CategoryReader {
  findById(id: string): Promise<CategorySummary | null>;
}

export class CreateProduct {
  constructor(
    private readonly products: ProductRepository,
    private readonly categories: CategoryReader,
  ) {}

  async execute(input: CreateProductInput): Promise<Product> {
    // 1. Reglas de negocio puras (normalización y validación de los datos)
    const newProduct = buildNewProduct(input);

    // 2. La categoría debe existir y estar activa
    const category = await this.categories.findById(newProduct.categoryId);
    if (!category) {
      throw new CategoryNotFoundError();
    }
    if (!category.isActive) {
      throw new CategoryInactiveError();
    }

    // 3. El slug no puede estar repetido (el repositorio también protege la condición de carrera)
    const existing = await this.products.findBySlug(newProduct.slug);
    if (existing) {
      throw new DuplicateSlugError();
    }

    // 4. Persistir
    return this.products.create(newProduct);
  }
}
