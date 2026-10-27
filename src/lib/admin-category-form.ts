/**
 * ============================================================================
 * LÓGICA PURA DEL FORMULARIO DE CATEGORÍAS
 * ============================================================================
 * Igual que `admin-product-form`, pero para categorías. Sin React: se prueba sola.
 * El estado (activa / desactivada) NO es parte del formulario: se cambia con los botones
 * "Desactivar" y "Reactivar" de la lista.
 */
import type { FieldErrors } from "./admin-api-client";
import type { Category } from "@/types/catalog";

export interface CategoryFormValues {
  name: string;
  slug: string;
  description: string;
}

export const emptyCategoryForm: CategoryFormValues = { name: "", slug: "", description: "" };

export function categoryToFormValues(category: Category): CategoryFormValues {
  return {
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
  };
}

export function validateCategoryForm(values: CategoryFormValues): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.name.trim()) errors.name = "El nombre es obligatorio.";
  return errors;
}

/** Cuerpo de POST /api/categorias. */
export function buildCreateCategoryPayload(values: CategoryFormValues): Record<string, unknown> {
  const slug = values.slug.trim();
  const description = values.description.trim();

  return {
    name: values.name.trim(),
    description: description || null,
    ...(slug ? { slug } : {}),
  };
}

/** Cuerpo de PATCH /api/categorias/:id: solo lo que cambió (vacío si no cambió nada). */
export function buildUpdateCategoryPayload(
  values: CategoryFormValues,
  original: Category,
): Record<string, unknown> {
  const changes: Record<string, unknown> = {};

  const name = values.name.trim();
  if (name !== original.name) changes.name = name;

  const slug = values.slug.trim();
  if (slug !== original.slug) changes.slug = slug;

  const description = values.description.trim();
  if (description !== (original.description ?? "")) changes.description = description || null;

  return changes;
}
