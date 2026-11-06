"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";

import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input, NativeSelect, Textarea } from "@/components/ui/input";
import { AdminApiError, adminRequest, adminUpload, type FieldErrors } from "@/lib/admin-api-client";
import {
  buildCreateProductPayload,
  buildUpdateProductPayload,
  emptyProductForm,
  productToFormValues,
  sanitizePriceInput,
  validateProductForm,
  type ProductFormValues,
} from "@/lib/admin-product-form";
import { formatPrice } from "@/lib/format-price";
import { checkImageFile } from "@/lib/image-upload";
import type { Category, Product } from "@/types/catalog";

import { FormField } from "./form-field";
import { ImagePreview } from "./image-preview";

interface ProductFormProps {
  /** TODAS las categorías (el formulario decide cuáles se pueden elegir). */
  categories: Category[];
  /** Si se pasa, el formulario EDITA ese producto; si no, crea uno nuevo. */
  product?: Product;
}

/**
 * Formulario de producto (crear / editar), a pantalla completa.
 *
 *  - Crear  → POST  /api/productos
 *  - Editar → PATCH /api/productos/:id, enviando SOLO los campos modificados
 *
 * Al guardar, vuelve a la lista con un aviso de confirmación (`?aviso=...`).
 * Los errores que devuelve la API se muestran junto al campo correspondiente.
 */
export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>(product ? productToFormValues(product) : emptyProductForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const isEditing = Boolean(product);

  /**
   * Categorías que se pueden elegir: las ACTIVAS (la API rechaza productos en categorías
   * desactivadas) y, al editar, también la categoría actual del producto aunque esté
   * desactivada, para que el formulario no "pierda" su valor.
   */
  const selectable = categories.filter((c) => c.isActive || c.id === product?.categoryId);

  function update<K extends keyof ProductFormValues>(field: K, value: ProductFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const errors = validateProductForm(values);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setFormError("Revisa los campos marcados.");
      return;
    }

    const changes = product ? buildUpdateProductPayload(values, product) : null;
    if (product && Object.keys(changes ?? {}).length === 0) {
      router.push("/admin/productos?aviso=sin-cambios");
      return;
    }

    setPending(true);
    try {
      if (product) await adminRequest("PATCH", `/api/productos/${product.id}`, changes);
      else await adminRequest("POST", "/api/productos", buildCreateProductPayload(values));

      // Con Cache Components, Next.js conserva esta página OCULTA (con su estado) al salir de
      // ella. Si no se reinicia aquí, "Nuevo producto" reaparecería con los datos del producto
      // anterior y el botón bloqueado en "Guardando…".
      if (!product) setValues(emptyProductForm);
      setFieldErrors({});
      setPending(false);

      // La lista es una ruta dinámica que siempre pide datos frescos al servidor: basta con
      // navegar (un `router.refresh()` extra solo duplicaría la petición).
      router.push(`/admin/productos?aviso=${product ? "producto-actualizado" : "producto-creado"}`);
    } catch (caught) {
      if (caught instanceof AdminApiError) {
        if (caught.isSessionExpired) {
          router.push("/admin/login");
          return;
        }
        setFieldErrors(caught.fieldErrors);
        setFormError(caught.message);
      } else {
        setFormError("No se pudo guardar el producto.");
      }
      setPending(false);
    }
  }

  /** Sube la imagen elegida a S3 y guarda en el formulario la URL que devuelve. */
  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // permite volver a elegir el mismo archivo
    if (!file) return;

    setUploadError(null);
    const problem = checkImageFile(file);
    if (problem) {
      setUploadError(problem);
      return;
    }

    setUploading(true);
    try {
      const { url } = await adminUpload(file);
      update("imageUrl", url);
    } catch (caught) {
      if (caught instanceof AdminApiError && caught.isSessionExpired) {
        router.push("/admin/login");
        return;
      }
      setUploadError(caught instanceof AdminApiError ? caught.message : "No se pudo subir la imagen.");
    } finally {
      setUploading(false);
    }
  }

  const priceNumber = Number(values.price);

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-8 lg:grid-cols-[1fr_16rem]">
      <div className="space-y-5">
        {formError && <Alert tone="error">{formError}</Alert>}

        <FormField name="name" label="Nombre" error={fieldErrors.name} required>
          {(field) => (
            <Input {...field} value={values.name} onChange={(e) => update("name", e.target.value)} maxLength={200} autoFocus={!isEditing} />
          )}
        </FormField>

        <FormField
          name="price"
          label="Precio (en pesos)"
          error={fieldErrors.price}
          hint="Solo números, sin puntos ni comas. Ejemplo: 89900"
          required
        >
          {(field) => (
            <>
              <Input
                {...field}
                inputMode="numeric"
                autoComplete="off"
                value={values.price}
                onChange={(e) => update("price", sanitizePriceInput(e.target.value))}
                placeholder="89900"
              />
              {/* Confirmación visual: así se ve el precio en la tienda. Evita errores de ceros. */}
              {priceNumber > 0 && (
                <p className="text-sm font-semibold text-brand-700" aria-live="polite">
                  Se verá como {formatPrice(priceNumber)}
                </p>
              )}
            </>
          )}
        </FormField>

        <FormField name="categoryId" label="Categoría" error={fieldErrors.categoryId} required>
          {(field) => (
            <NativeSelect {...field} value={values.categoryId} onChange={(e) => update("categoryId", e.target.value)}>
              <option value="">Selecciona una categoría</option>
              {selectable.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                  {category.isActive ? "" : " (desactivada)"}
                </option>
              ))}
            </NativeSelect>
          )}
        </FormField>

        <FormField name="description" label="Descripción" error={fieldErrors.description} hint="Opcional. Se respetan los saltos de línea.">
          {(field) => (
            <Textarea {...field} rows={5} value={values.description} onChange={(e) => update("description", e.target.value)} />
          )}
        </FormField>

        <FormField
          name="slug"
          label="Enlace (slug)"
          error={fieldErrors.slug}
          hint={
            isEditing
              ? "Si lo cambias, el enlace anterior de este producto dejará de funcionar."
              : "Opcional. Si lo dejas vacío se genera a partir del nombre."
          }
        >
          {(field) => (
            <Input {...field} value={values.slug} onChange={(e) => update("slug", e.target.value)} placeholder="ej. oso-grande" />
          )}
        </FormField>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-white p-4">
          <input
            type="checkbox"
            name="isAvailable"
            checked={values.isAvailable}
            onChange={(e) => update("isAvailable", e.target.checked)}
            className="mt-0.5 size-5 accent-[var(--color-brand-600)]"
          />
          <span>
            <span className="block text-sm font-semibold text-ink">Visible en la tienda</span>
            <span className="block text-xs text-muted">Si lo desmarcas, el producto queda oculto para los clientes.</span>
          </span>
        </label>

        <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
          <ButtonLink href="/admin/productos" variant="secondary">
            Cancelar
          </ButtonLink>
          <Button type="submit" disabled={pending || uploading}>
            {pending ? "Guardando…" : isEditing ? "Guardar cambios" : "Crear producto"}
          </Button>
        </div>
      </div>

      {/* Columna derecha: la imagen con su vista previa en vivo. */}
      <aside className="space-y-3">
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="sr-only"
          tabIndex={-1}
          aria-label="Elegir imagen del computador"
        />
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" disabled={uploading || pending} onClick={() => fileInput.current?.click()}>
            {uploading ? "Subiendo…" : values.imageUrl ? "Cambiar imagen" : "Subir imagen"}
          </Button>
          {values.imageUrl && !uploading && (
            <Button variant="ghost" size="sm" onClick={() => update("imageUrl", "")}>
              Quitar imagen
            </Button>
          )}
        </div>
        {uploadError && <Alert tone="error">{uploadError}</Alert>}
        <FormField
          name="imageUrl"
          label="URL de la imagen (se llena sola al subir)"
          error={fieldErrors.imageUrl}
          hint="Opcional. Sube un archivo o pega un enlace https://"
        >
          {(field) => (
            <Input {...field} type="url" inputMode="url" value={values.imageUrl} onChange={(e) => update("imageUrl", e.target.value)} placeholder="https://…" />
          )}
        </FormField>
        <ImagePreview key={values.imageUrl} url={values.imageUrl} />
      </aside>
    </form>
  );
}
