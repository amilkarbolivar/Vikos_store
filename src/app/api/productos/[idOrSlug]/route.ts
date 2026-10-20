import { getContainer } from '@/infrastructure/composition/prisma-container';
import { requireAdmin } from '@/infrastructure/composition/require-admin-composition';
import { deleteProductHandler } from '@/modules/products/presentation/delete-product-handler';
import { getProductHandler } from '@/modules/products/presentation/get-product-handler';
import { updateProductHandler } from '@/modules/products/presentation/update-product-handler';

type Context = { params: Promise<{ idOrSlug: string }> };

// Los casos de uso se piden DENTRO de `execute` (no al armar el handler): así la autorización y
// la validación responden 401/400 sin necesitar la base de datos, igual que en /api/productos.

/** Público: id (UUID) o slug. Un administrador ve también los productos ocultos. */
export async function GET(request: Request, { params }: Context): Promise<Response> {
  const { idOrSlug } = await params;
  return getProductHandler({
    requireAdmin,
    getPublicProduct: { execute: (key) => getContainer().products.getPublic.execute(key) },
    getProductById: { execute: (id) => getContainer().products.getById.execute(id) },
    getProductBySlug: { execute: (slug) => getContainer().products.getBySlug.execute(slug) },
  })(request, idOrSlug);
}

/** Solo administradores; el segmento debe ser el id (UUID). */
export async function PATCH(request: Request, { params }: Context): Promise<Response> {
  const { idOrSlug } = await params;
  return updateProductHandler({
    requireAdmin,
    updateProduct: { execute: (id, input) => getContainer().products.update.execute(id, input) },
  })(request, idOrSlug);
}

/** Solo administradores; eliminación definitiva. Para ocultar usar /desactivar. */
export async function DELETE(request: Request, { params }: Context): Promise<Response> {
  const { idOrSlug } = await params;
  return deleteProductHandler({
    requireAdmin,
    deleteProduct: { execute: (id) => getContainer().products.delete.execute(id) },
  })(request, idOrSlug);
}
