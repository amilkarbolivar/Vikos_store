/**
 * ============================================================================
 * TIPOS DEL CATÁLOGO (lo que devuelve la API)
 * ============================================================================
 * No volvemos a escribir estas formas a mano: se importan (solo como TIPOS, no se
 * ejecuta nada del backend) desde los "presenters" de la API. Así, si el backend cambia
 * un campo, TypeScript marca el error aquí en lugar de fallar en silencio en pantalla.
 */
import type { CategoryResponse } from "@/modules/categories/presentation/category-presenter";
import type { ProductResponse } from "@/modules/products/presentation/product-presenter";

/** Un producto tal como lo entrega GET /api/productos. `price` está en pesos. */
export type Product = ProductResponse;

/** Una categoría tal como la entrega GET /api/categorias. */
export type Category = CategoryResponse;
