export interface Product {
  id: string;
  name: string;
  slug: string;
  /** En la base de datos puede ser NULL; el dominio siempre la expone como texto ("" si no hay). */
  description: string;
  /** Precio en centavos de peso. PostgreSQL lo guarda como NUMERIC(12,2) en pesos. */
  priceInCents: number;
  /**
   * CAMBIO RESPECTO AL DOMINIO ANTERIOR: ahora puede ser null.
   * La base de datos hace `ON DELETE SET NULL` en products.category_id, así que un producto
   * existente puede quedar sin categoría. Tipar `string` ocultaría ese caso.
   */
  categoryId: string | null;
  /** URL de la imagen principal (tabla product_images). */
  imageUrl: string | null;
  /** Se guarda en products.is_active. */
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Datos necesarios para crear un producto: al crear, la categoría sí es obligatoria. */
export type NewProduct = Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'categoryId'> & {
  categoryId: string;
};
