/**
 * ============================================================================
 * SERVICIO DE DATOS DEL PANEL (lectura, en el servidor)
 * ============================================================================
 * Igual que `catalog-service`, pero para datos PROTEGIDOS: los endpoints del administrador
 * exigen la cookie de sesión. Como estas funciones corren en el servidor (Server Components),
 * hay que tomar la cookie de la petición del navegador y REENVIARLA a la API.
 *
 *   navegador ──cookie──▶ página (servidor) ──cookie──▶ /api/...
 *
 * Si la API responde 401 (sin sesión o sesión vencida) se redirige a /admin/login.
 * (La API vuelve a comprobar la sesión en cada petición: esto es solo comodidad de navegación,
 * la seguridad real está en los endpoints.)
 *
 * `cookies()` es un dato "de petición": con Cache Components, quien llame estas funciones debe
 * estar dentro de un <Suspense>.
 */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { ApiError, apiGet, apiGetOrNull } from "@/lib/api-client";
import type { AdminSession } from "@/types/admin";
import type { Category, Product } from "@/types/catalog";

interface ListResponse<T> {
  data: T[];
}

/** Cabecera con la cookie de la petición actual, lista para reenviar a la API. */
async function authHeaders(): Promise<Record<string, string>> {
  return { cookie: (await cookies()).toString() };
}

/** Ejecuta una lectura protegida y, si la API dice "no autenticado", manda al login. */
async function withAdminAuth<T>(load: () => Promise<T>): Promise<T> {
  try {
    return await load();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/admin/login");
    throw error;
  }
}

/** Administrador de la sesión actual, o `null` si no hay sesión válida. */
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  try {
    return await apiGet<AdminSession>("/api/auth/me", { headers: await authHeaders() });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
});

/** TODAS las categorías, también las desactivadas. */
export const getAdminCategories = cache(async (): Promise<Category[]> =>
  withAdminAuth(async () => {
    const { data } = await apiGet<ListResponse<Category>>("/api/categorias?includeInactive=true", {
      headers: await authHeaders(),
    });
    return data;
  }),
);

/** TODOS los productos, también los ocultos. */
export const getAdminProducts = cache(async (): Promise<Product[]> =>
  withAdminAuth(async () => {
    const { data } = await apiGet<ListResponse<Product>>("/api/productos?includeInactive=true", {
      headers: await authHeaders(),
    });
    return data;
  }),
);

/** Un producto por id (también si está oculto), o `null` si no existe. */
export const getAdminProduct = cache(async (id: string): Promise<Product | null> =>
  withAdminAuth(async () =>
    apiGetOrNull<Product>(`/api/productos/${encodeURIComponent(id)}`, { headers: await authHeaders() }),
  ),
);
