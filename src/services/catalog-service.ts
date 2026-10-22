/**
 * ============================================================================
 * SERVICIO DEL CATÁLOGO
 * ============================================================================
 * Capa de acceso a datos que usan las páginas y los bloques de la tienda. Cada función
 * corresponde a un endpoint público de la API y devuelve datos ya tipados.
 *
 *   Página / bloque  →  catalog-service  →  api-client  →  /api/...
 *
 * Reglas de esta capa:
 *  - No sabe nada de React ni de diseño.
 *  - Los recursos que "pueden no existir" devuelven `null` (la página decide qué mostrar).
 *  - Cada función está envuelta en `cache()` de React: si dos bloques de la MISMA página
 *    piden lo mismo (por ejemplo, `generateMetadata` y la propia página piden el mismo
 *    producto), la API se consulta una sola vez. OJO: `cache` compara los argumentos con
 *    `===`, por eso todos los argumentos son valores simples (texto), nunca objetos.
 */
import { cache } from "react";

import { apiGet, apiGetOrNull } from "@/lib/api-client";
import type { Category, Product } from "@/types/catalog";

/** Las listas de la API vienen envueltas así: { data: [...] }. */
interface ListResponse<T> {
  data: T[];
}

/** Categorías activas (GET /api/categorias). */
export const getCategories = cache(async (): Promise<Category[]> => {
  const { data } = await apiGet<ListResponse<Category>>("/api/categorias");
  return data;
});

/**
 * Una categoría por slug (ej. "peluches") o por id. La API acepta ambos en el mismo endpoint.
 * Devuelve `null` si no existe o si está desactivada (el público no puede verla).
 */
export const getCategory = cache(async (idOrSlug: string): Promise<Category | null> => {
  return apiGetOrNull<Category>(`/api/categorias/${encodeURIComponent(idOrSlug)}`);
});

/**
 * Productos visibles en la tienda (GET /api/productos).
 * Sin argumento devuelve todos; con `categoryId` solo los de esa categoría.
 */
export const getProducts = cache(async (categoryId?: string): Promise<Product[]> => {
  const query = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : "";
  const { data } = await apiGet<ListResponse<Product>>(`/api/productos${query}`);
  return data;
});

/**
 * Un producto por slug (ej. "oso-grande") o por id.
 * Devuelve `null` si no existe, está oculto o su categoría está desactivada.
 */
export const getProduct = cache(async (idOrSlug: string): Promise<Product | null> => {
  return apiGetOrNull<Product>(`/api/productos/${encodeURIComponent(idOrSlug)}`);
});
