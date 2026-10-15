import type { NewProduct, Product } from './product';

export interface ProductListFilter {
  categoryId?: string;
  onlyAvailable?: boolean;
}

export interface ProductChanges {
  name?: string;
  slug?: string;
  description?: string;
  priceInCents?: number;
  categoryId?: string | null;
  /** undefined = no tocar la imagen; null = quitarla; texto = reemplazar la imagen principal. */
  imageUrl?: string | null;
  isAvailable?: boolean;
}

export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  list(filter?: ProductListFilter): Promise<Product[]>;
  create(data: NewProduct): Promise<Product>;
  update(id: string, changes: ProductChanges): Promise<Product>;
  delete(id: string): Promise<void>;
}
