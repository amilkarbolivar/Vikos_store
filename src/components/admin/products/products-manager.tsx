"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { ProductImage } from "@/components/catalog/product-image";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, NativeSelect } from "@/components/ui/input";
import { AdminApiError, adminRequest } from "@/lib/admin-api-client";
import { formatPrice } from "@/lib/format-price";
import type { Category, Product } from "@/types/catalog";

import { EyeIcon, EyeOffIcon, PencilIcon, PlusIcon, TrashIcon } from "../admin-icons";
import { DataTable, Td, Th } from "../common/data-table";
import { RowButton, RowLink } from "../common/row-action";
import { StatusBadge } from "../common/status-badge";

interface ProductActionsProps {
  product: Product;
  /** `true` mientras se cambia su visibilidad (se bloquea ese botón). */
  busy: boolean;
  onToggle: () => void;
  onDelete: () => void;
}

/**
 * Las tres acciones de un producto (Editar, Ocultar/Mostrar, Eliminar). Se usa tanto en la fila
 * de la tabla como en la tarjeta de celular, para que ambas vistas se comporten igual.
 */
function ProductActions({ product, busy, onToggle, onDelete }: ProductActionsProps) {
  return (
    <>
      <RowLink href={`/admin/productos/${product.id}`} label={`Editar ${product.name}`}>
        <PencilIcon />
        Editar
      </RowLink>
      <RowButton label={`${product.isAvailable ? "Ocultar" : "Mostrar"} ${product.name}`} disabled={busy} onClick={onToggle}>
        {product.isAvailable ? <EyeOffIcon /> : <EyeIcon />}
        {product.isAvailable ? "Ocultar" : "Mostrar"}
      </RowButton>
      <RowButton label={`Eliminar ${product.name}`} danger onClick={onDelete}>
        <TrashIcon />
        Eliminar
      </RowButton>
    </>
  );
}

interface ProductsManagerProps {
  products: Product[];
  categories: Category[];
  /** Aviso de confirmación (ej. "Producto creado correctamente.") que llega tras guardar. */
  notice?: string;
}

type StatusFilter = "all" | "visible" | "hidden";

interface Message {
  tone: "success" | "error";
  text: string;
}

/**
 * Gestión de productos: buscador, filtros y tabla con todas las acciones.
 *
 * Los filtros se aplican en el navegador sobre la lista que ya llegó del servidor (es una
 * lista administrativa, no necesita pedir nada a la API para filtrar). Las acciones (ocultar,
 * mostrar, eliminar) sí llaman a la API y después piden los datos frescos con `router.refresh()`.
 */
export function ProductsManager({ products, categories, notice }: ProductsManagerProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<Message | null>(null);

  // Eliminación: el producto que se está por borrar, y el estado de esa operación.
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const categoriesById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  /** Productos que pasan los filtros actuales. */
  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    return products.filter((product) => {
      if (text && !product.name.toLowerCase().includes(text)) return false;
      if (categoryId && product.categoryId !== categoryId) return false;
      if (status === "visible" && !product.isAvailable) return false;
      if (status === "hidden" && product.isAvailable) return false;
      return true;
    });
  }, [products, query, categoryId, status]);

  const hasFilters = Boolean(query.trim() || categoryId || status !== "all");
  const goToLogin = () => router.push("/admin/login");

  /** Oculta o muestra un producto en la tienda (PATCH isAvailable). */
  async function toggleAvailable(product: Product) {
    setBusyId(product.id);
    setMessage(null);
    try {
      await adminRequest("PATCH", `/api/productos/${product.id}`, { isAvailable: !product.isAvailable });
      setMessage({
        tone: "success",
        text: product.isAvailable ? `«${product.name}» ahora está oculto en la tienda.` : `«${product.name}» ahora es visible en la tienda.`,
      });
      router.refresh();
    } catch (caught) {
      if (caught instanceof AdminApiError && caught.isSessionExpired) return goToLogin();
      setMessage({ tone: "error", text: caught instanceof AdminApiError ? caught.message : "No se pudo cambiar la visibilidad." });
    } finally {
      setBusyId(null);
    }
  }

  /** Elimina definitivamente el producto elegido en la ventana de confirmación. */
  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await adminRequest("DELETE", `/api/productos/${toDelete.id}`);
      setMessage({ tone: "success", text: `«${toDelete.name}» se eliminó definitivamente.` });
      setToDelete(null);
      router.refresh();
    } catch (caught) {
      if (caught instanceof AdminApiError && caught.isSessionExpired) return goToLogin();
      // Por ejemplo un 409: "está referenciado por otros registros, desactívalo".
      setDeleteError(caught instanceof AdminApiError ? caught.message : "No se pudo eliminar el producto.");
    } finally {
      setDeleting(false);
    }
  }

  function closeDeleteDialog() {
    if (deleting) return;
    setToDelete(null);
    setDeleteError(null);
  }

  return (
    <>
      {notice && !message && <Alert tone="success" className="mb-4">{notice}</Alert>}
      {message && <Alert tone={message.tone} className="mb-4">{message.text}</Alert>}

      {/* Barra de herramientas: buscador + filtros + botón de crear. */}
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_14rem_11rem_auto]">
        <Input
          type="search"
          aria-label="Buscar producto por nombre"
          placeholder="Buscar por nombre…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <NativeSelect aria-label="Filtrar por categoría" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
              {category.isActive ? "" : " (desactivada)"}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect aria-label="Filtrar por estado" value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)}>
          <option value="all">Todos los estados</option>
          <option value="visible">Visibles</option>
          <option value="hidden">Ocultos</option>
        </NativeSelect>
        <ButtonLink href="/admin/productos/nuevo" className="sm:col-span-2 lg:col-span-1">
          <PlusIcon />
          Nuevo producto
        </ButtonLink>
      </div>

      <p className="mb-3 text-sm text-muted" aria-live="polite">
        {hasFilters ? `Mostrando ${filtered.length} de ${products.length} productos` : `${products.length} ${products.length === 1 ? "producto" : "productos"}`}
      </p>

      {products.length === 0 ? (
        <EmptyState
          title="Aún no hay productos"
          description="Crea el primero para que aparezca en la tienda."
          action={<ButtonLink href="/admin/productos/nuevo">Crear producto</ButtonLink>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState title="Ningún producto coincide" description="Prueba con otra búsqueda o quita los filtros." />
      ) : (
        <>
          {/* ---- Celular: una TARJETA por producto (una tabla obligaría a deslizar de lado). ---- */}
          <ul className="space-y-3 md:hidden" aria-label="Lista de productos">
            {filtered.map((product) => {
              const category = product.categoryId ? categoriesById.get(product.categoryId) : undefined;
              const hiddenByCategory = product.isAvailable && category && !category.isActive;

              return (
                <li key={product.id} className="rounded-card border border-line bg-white p-4 shadow-card">
                  <div className="flex gap-3">
                    <ProductImage src={product.imageUrl} alt="" className="size-16 shrink-0 rounded-lg" />
                    <div className="min-w-0 flex-1">
                      <Link href={`/admin/productos/${product.id}`} className="block font-semibold text-ink hover:text-brand-700">
                        {product.name}
                      </Link>
                      <p className="truncate text-xs text-muted">{category ? category.name : "Sin categoría"}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-brand-700">{formatPrice(product.price)}</span>
                        <StatusBadge active={product.isAvailable} activeLabel="Visible" inactiveLabel="Oculto" />
                      </div>
                      {hiddenByCategory && <p className="mt-1 text-xs text-amber-700">Su categoría está desactivada: no se ve en la tienda.</p>}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1 border-t border-line pt-2">
                    <ProductActions
                      product={product}
                      busy={busyId === product.id}
                      onToggle={() => toggleAvailable(product)}
                      onDelete={() => {
                        setDeleteError(null);
                        setToDelete(product);
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>

          {/* ---- Pantallas medianas y grandes: TABLA. ---- */}
          <DataTable caption="Lista de productos" className="hidden md:block">
            <thead>
              <tr>
                <Th>Producto</Th>
                <Th className="hidden 2xl:table-cell">Categoría</Th>
                <Th className="text-right">Precio</Th>
                <Th>Estado</Th>
                <Th className="text-right">Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => {
                const category = product.categoryId ? categoriesById.get(product.categoryId) : undefined;
                // Visible para el administrador pero NO en la tienda: la categoría está desactivada.
                const hiddenByCategory = product.isAvailable && category && !category.isActive;

                return (
                  <tr key={product.id}>
                    <Td>
                      <div className="flex items-center gap-3">
                        <ProductImage src={product.imageUrl} alt="" className="size-12 shrink-0 rounded-lg" />
                        <div className="min-w-0">
                          <Link href={`/admin/productos/${product.id}`} className="block truncate font-semibold text-ink hover:text-brand-700">
                            {product.name}
                          </Link>
                          <p className="truncate text-xs text-muted">/{product.slug}</p>
                          {/* En pantallas medianas no hay columna "Categoría" (no cabe): va aquí, bajo el nombre. */}
                          <p className="truncate text-xs font-medium text-ink/70 2xl:hidden">{category ? category.name : "Sin categoría"}</p>
                        </div>
                      </div>
                    </Td>
                    <Td className="hidden 2xl:table-cell">{category ? category.name : <span className="text-muted">Sin categoría</span>}</Td>
                    <Td className="text-right font-semibold tabular-nums">{formatPrice(product.price)}</Td>
                    <Td>
                      <StatusBadge active={product.isAvailable} activeLabel="Visible" inactiveLabel="Oculto" />
                      {hiddenByCategory && (
                        <p className="mt-1 max-w-[11rem] text-xs text-amber-700">Su categoría está desactivada: no se ve en la tienda.</p>
                      )}
                    </Td>
                    <Td>
                      <div className="flex justify-end gap-1">
                        <ProductActions
                          product={product}
                          busy={busyId === product.id}
                          onToggle={() => toggleAvailable(product)}
                          onDelete={() => {
                            setDeleteError(null);
                            setToDelete(product);
                          }}
                        />
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </DataTable>
        </>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        title={toDelete ? `¿Eliminar «${toDelete.name}»?` : "Eliminar"}
        description="Se eliminará definitivamente y no se puede deshacer. Si solo quieres que deje de verse en la tienda, usa «Ocultar»."
        confirmLabel="Eliminar definitivamente"
        pending={deleting}
        error={deleteError}
      />
    </>
  );
}
