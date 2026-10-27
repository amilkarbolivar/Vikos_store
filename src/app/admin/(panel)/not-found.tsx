import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

/** 404 dentro del panel (por ejemplo, editar un producto que ya no existe). */
export default function AdminNotFound() {
  return (
    <EmptyState
      title="No encontramos esto"
      description="Puede que haya sido eliminado o que el enlace esté mal escrito."
      action={<ButtonLink href="/admin/productos">Volver a productos</ButtonLink>}
    />
  );
}
