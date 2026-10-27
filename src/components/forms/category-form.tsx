"use client";

import { useState, type FormEvent } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { AdminApiError, adminRequest, type FieldErrors } from "@/lib/admin-api-client";
import {
  buildCreateCategoryPayload,
  buildUpdateCategoryPayload,
  categoryToFormValues,
  emptyCategoryForm,
  validateCategoryForm,
} from "@/lib/admin-category-form";
import type { Category } from "@/types/catalog";

import { FormField } from "./form-field";

interface CategoryFormProps {
  /** Si se pasa, el formulario EDITA esa categoría; si no, crea una nueva. */
  category?: Category;
  /** Se llama cuando se guardó correctamente (el padre cierra la ventana y refresca la lista). */
  onSaved: () => void;
  onCancel: () => void;
  /** Se llama si la sesión venció (el padre redirige al login). */
  onSessionExpired: () => void;
}

/** Formulario de categoría (crear / editar). Vive dentro de una ventana (`Dialog`). */
export function CategoryForm({ category, onSaved, onCancel, onSessionExpired }: CategoryFormProps) {
  const [values, setValues] = useState(category ? categoryToFormValues(category) : emptyCategoryForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const set = (field: keyof typeof values) => (value: string) => setValues((current) => ({ ...current, [field]: value }));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    // 1) Comprobación rápida en el navegador.
    const errors = validateCategoryForm(values);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    // 2) Al editar, enviamos solo lo que cambió; si no cambió nada, no hay nada que enviar.
    const changes = category ? buildUpdateCategoryPayload(values, category) : null;
    if (category && Object.keys(changes ?? {}).length === 0) {
      onSaved();
      return;
    }

    setPending(true);
    try {
      if (category) await adminRequest("PATCH", `/api/categorias/${category.id}`, changes);
      else await adminRequest("POST", "/api/categorias", buildCreateCategoryPayload(values));
      onSaved();
    } catch (caught) {
      if (caught instanceof AdminApiError) {
        if (caught.isSessionExpired) return onSessionExpired();
        setFieldErrors(caught.fieldErrors);
        setFormError(caught.message);
      } else {
        setFormError("No se pudo guardar la categoría.");
      }
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {formError && <Alert tone="error">{formError}</Alert>}

      <FormField name="name" label="Nombre" error={fieldErrors.name} required>
        {(field) => (
          <Input {...field} value={values.name} onChange={(e) => set("name")(e.target.value)} autoFocus maxLength={120} />
        )}
      </FormField>

      <FormField
        name="slug"
        label="Enlace (slug)"
        error={fieldErrors.slug}
        hint={
          category
            ? "Si lo cambias, el enlace anterior de esta categoría dejará de funcionar."
            : "Opcional. Si lo dejas vacío se genera a partir del nombre."
        }
      >
        {(field) => (
          <Input {...field} value={values.slug} onChange={(e) => set("slug")(e.target.value)} placeholder="ej. peluches" />
        )}
      </FormField>

      <FormField name="description" label="Descripción" error={fieldErrors.description} hint="Opcional. Se muestra en la página de la categoría.">
        {(field) => (
          <Textarea {...field} value={values.description} onChange={(e) => set("description")(e.target.value)} rows={3} />
        )}
      </FormField>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel} disabled={pending}>
          Cancelar
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : category ? "Guardar cambios" : "Crear categoría"}
        </Button>
      </div>
    </form>
  );
}
