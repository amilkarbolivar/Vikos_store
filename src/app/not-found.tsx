import { NotFoundView } from "@/components/layout/not-found-view";
import { StoreShell } from "@/components/layout/store-shell";

/**
 * 404 GLOBAL: se usa cuando la URL no coincide con ninguna ruta. Como no pertenece a ningún
 * grupo, no recibe ningún marco automáticamente: se lo ponemos aquí para que se vea igual que
 * el 404 de la tienda.
 */
export default function GlobalNotFound() {
  return (
    <StoreShell>
      <NotFoundView />
    </StoreShell>
  );
}
