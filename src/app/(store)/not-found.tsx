import { NotFoundView } from "@/components/layout/not-found-view";

/**
 * Pantalla 404 de la tienda. Next.js la muestra cuando una página de la tienda llama a
 * `notFound()` (por ejemplo, un producto que no existe o está oculto). Se dibuja DENTRO del
 * marco de la tienda (encabezado y pie).
 */
export default function NotFound() {
  return <NotFoundView />;
}
