import { isUuid } from '../../shared/domain/uuid';
import { isAdminRequest, type RequireAdmin } from '../../shared/presentation/admin-guard';
import type { Product } from '../domain/product';
import { toErrorResponse, type ErrorLogger } from './http-error-mapper';
import { toProductResponse } from './product-presenter';

export interface GetProductHandlerDeps {
  /** Solo se usa para decidir qué ve quien llama; nunca rechaza la petición. */
  requireAdmin: RequireAdmin;
  /** Reglas de visibilidad de la tienda (disponible + categoría activa). */
  getPublicProduct: { execute(idOrSlug: string): Promise<Product> };
  /** Sin reglas de visibilidad: solo para administradores. */
  getProductById: { execute(id: string): Promise<Product> };
  getProductBySlug: { execute(slug: string): Promise<Product> };
  logger?: ErrorLogger;
}

/**
 * Adaptador HTTP de GET /api/productos/:idOrSlug.
 * Público: el visitante solo ve productos visibles en la tienda (si no, 404).
 * Un administrador ve también los ocultos, para poder editarlos o reactivarlos.
 */
export function getProductHandler(deps: GetProductHandlerDeps) {
  const logger = deps.logger ?? console;

  return async function handle(request: Request, idOrSlug: string): Promise<Response> {
    try {
      const admin = await isAdminRequest(deps.requireAdmin, request);

      const product = admin
        ? isUuid(idOrSlug)
          ? await deps.getProductById.execute(idOrSlug)
          : await deps.getProductBySlug.execute(idOrSlug)
        : await deps.getPublicProduct.execute(idOrSlug);

      return Response.json(toProductResponse(product), {
        // Una respuesta que depende de la sesión no debe quedar en cachés compartidas.
        headers: { 'Cache-Control': 'private, no-store' },
      });
    } catch (error) {
      return toErrorResponse(error, logger);
    }
  };
}
