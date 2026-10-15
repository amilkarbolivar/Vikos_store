import type { Product } from '../domain/product';

export interface ProductResponse {
  id: string;
  name: string;
  slug: string;
  description: string;
  /** Precio en pesos colombianos. */
  price: number;
  priceInCents: number;
  categoryId: string | null;
  imageUrl: string | null;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Transforma el objeto de dominio en la respuesta pública de la API (nunca objetos de Prisma). */
export function toProductResponse(product: Product): ProductResponse {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.priceInCents / 100,
    priceInCents: product.priceInCents,
    categoryId: product.categoryId,
    imageUrl: product.imageUrl,
    isAvailable: product.isAvailable,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}
