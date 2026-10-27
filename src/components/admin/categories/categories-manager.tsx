"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { CategoryForm } from "@/components/forms/category-form";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { AdminApiError, adminRequest } from "@/lib/admin-api-client";
import type { Category } from "@/types/catalog";

import { EyeIcon, EyeOffIcon, PencilIcon, PlusIcon } from "../admin-icons";
import { DataTable, Td, Th } from "../common/data-table";
import { RowButton } from "../common/row-action";
import { StatusBadge } from "../common/status-badge";

interface CategoriesManagerProps {
  categories: Category[];
  /** Cuántos productos tiene cada categoría: { [categoryId]: número }. */
  productCounts: Record<string, number>;
}

/** Qué ventana está abierta: crear, editar una categoría concreta, o ninguna. */
type DialogState = { mode: "create" } | { mode: "edit"; category: Category } | null;

interface Message {
  tone: "success" | "error";
  text: string;
}

/**
 * Gestión de categorías: tabla con todas (activas y desactivadas) y sus acciones.
 *
 * Es un componente de cliente porque tiene estado (qué ventana está abierta, qué fila está
 * ocupada, mensajes). Los DATOS llegan ya cargados desde el servidor como props; tras cada
 * acción se llama a `router.refresh()`, que le pide al servidor los datos actualizados.
 */
export function CategoriesManager({ categories, productCounts }: CategoriesManagerProps) {
  const router = useRouter();
  const [dialog, setDialog] = useState<DialogState>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<Message | null>(null);

  const goToLogin = () => router.push("/admin/login");

  /** Desactiva o reactiva una categoría (los productos NO se tocan: solo se ocultan/muestran). */
  async function toggleActive(category: Category) {
    setBusyId(category.id);
    setMessage(null);
    try {
      await adminRequest("POST", `/api/categorias/${category.id}/${category.isActive ? "desactivar" : "reactivar"}`);
      setMessage({
        tone: "success",
        text: category.isActive
          ? `«${category.name}» se desactivó. Sus productos ya no se ven en la tienda (no se borraron).`
          : `«${category.name}» se reactivó. Sus productos visibles vuelven a mostrarse en la tienda.`,
      });
      router.refresh();
    } catch (caught) {
      if (caught instanceof AdminApiError && caught.isSessionExpired) return goToLogin();
      setMessage({ tone: "error", text: caught instanceof AdminApiError ? caught.message : "No se pudo cambiar el estado." });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {categories.length} {categories.length === 1 ? "categoría" : "categorías"}
        </p>
        <Button onClick={() => setDialog({ mode: "create" })}>
          <PlusIcon />
          Nueva categoría
        </Button>
      </div>

      {message && (
        <Alert tone={message.tone} className="mb-4">
          {message.text}
        </Alert>
      )}

      {categories.length === 0 ? (
        <EmptyState
          title="Aún no hay categorías"
          description="Crea la primera para empezar a organizar tus productos."
          action={<Button onClick={() => setDialog({ mode: "create" })}>Crear categoría</Button>}
        />
      ) : (
        <>
          {/* ---- Celular: una TARJETA por categoría. ---- */}
          <ul className="space-y-3 md:hidden" aria-label="Lista de categorías">
            {categories.map((category) => (
              <li key={category.id} className="rounded-card border border-line bg-white p-4 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">{category.name}</p>
                    <p className="text-xs text-muted">/{category.slug}</p>
                  </div>
                  <StatusBadge active={category.isActive} />
                </div>
                {category.description && <p className="mt-2 text-sm text-muted">{category.description}</p>}
                <p className="mt-2 text-xs font-semibold text-ink/70">
                  {productCounts[category.id] ?? 0} {(productCounts[category.id] ?? 0) === 1 ? "producto" : "productos"}
                </p>
                <div className="mt-3 flex flex-wrap gap-1 border-t border-line pt-2">
                  <RowButton label={`Editar ${category.name}`} onClick={() => setDialog({ mode: "edit", category })}>
                    <PencilIcon />
                    Editar
                  </RowButton>
                  <RowButton
                    label={`${category.isActive ? "Desactivar" : "Reactivar"} ${category.name}`}
                    disabled={busyId === category.id}
                    onClick={() => toggleActive(category)}
                  >
                    {category.isActive ? <EyeOffIcon /> : <EyeIcon />}
                    {category.isActive ? "Desactivar" : "Reactivar"}
                  </RowButton>
                </div>
              </li>
            ))}
          </ul>

          {/* ---- Pantallas medianas y grandes: TABLA. ---- */}
        <DataTable caption="Lista de categorías" className="hidden md:block">
          <thead>
            <tr>
              <Th>Nombre</Th>
              <Th className="hidden md:table-cell">Descripción</Th>
              <Th className="text-right">Productos</Th>
              <Th>Estado</Th>
              <Th className="text-right">Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <Td>
                  <p className="font-semibold text-ink">{category.name}</p>
                  <p className="text-xs text-muted">/{category.slug}</p>
                </Td>
                <Td className="hidden max-w-xs md:table-cell">
                  <p className="line-clamp-2 text-muted">{category.description ?? "—"}</p>
                </Td>
                <Td className="text-right tabular-nums">{productCounts[category.id] ?? 0}</Td>
                <Td>
                  <StatusBadge active={category.isActive} />
                </Td>
                <Td>
                  <div className="flex justify-end gap-1">
                    <RowButton label={`Editar ${category.name}`} onClick={() => setDialog({ mode: "edit", category })}>
                      <PencilIcon />
                      Editar
                    </RowButton>
                    <RowButton
                      label={`${category.isActive ? "Desactivar" : "Reactivar"} ${category.name}`}
                      disabled={busyId === category.id}
                      onClick={() => toggleActive(category)}
                    >
                      {category.isActive ? <EyeOffIcon /> : <EyeIcon />}
                      {category.isActive ? "Desactivar" : "Reactivar"}
                    </RowButton>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </DataTable>
        </>
      )}

      <Dialog
        open={dialog !== null}
        onClose={() => setDialog(null)}
        title={dialog?.mode === "edit" ? "Editar categoría" : "Nueva categoría"}
      >
        {dialog && (
          <CategoryForm
            // `key`: al abrir otra categoría el formulario se reinicia con sus datos.
            key={dialog.mode === "edit" ? dialog.category.id : "nueva"}
            category={dialog.mode === "edit" ? dialog.category : undefined}
            onCancel={() => setDialog(null)}
            onSessionExpired={goToLogin}
            onSaved={() => {
              setDialog(null);
              setMessage({ tone: "success", text: "Categoría guardada correctamente." });
              router.refresh();
            }}
          />
        )}
      </Dialog>
    </>
  );
}
