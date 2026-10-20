import { ValidationError, type ValidationIssue } from '../../shared/domain/errors';
import { requireJsonObject } from '../../shared/presentation/read-json-body';
import type { CreateCategoryInput } from '../application/create-category';
import type { UpdateCategoryInput } from '../application/update-category';

/**
 * Únicos campos que acepta la API de categorías. `isActive` NO está: el estado se cambia con
 * POST /api/categorias/:id/desactivar y /reactivar, para que la intención quede explícita.
 */
const ALLOWED_FIELDS = new Set(['name', 'slug', 'description']);

function checkFields(record: Record<string, unknown>, issues: ValidationIssue[]): void {
  for (const key of Object.keys(record)) {
    if (!ALLOWED_FIELDS.has(key)) {
      issues.push({ field: key, message: 'Campo no permitido' });
    }
  }
}

/** Valida solo la ESTRUCTURA del JSON de POST /api/categorias. Las reglas viven en el dominio. */
export function parseCreateCategoryBody(body: unknown): CreateCategoryInput {
  const record = requireJsonObject(body);
  const issues: ValidationIssue[] = [];
  checkFields(record, issues);

  const { name, slug, description } = record;

  if (typeof name !== 'string') {
    issues.push({ field: 'name', message: 'El nombre es obligatorio y debe ser texto' });
  }
  if (slug != null && typeof slug !== 'string') {
    issues.push({ field: 'slug', message: 'El slug debe ser texto' });
  }
  if (description != null && typeof description !== 'string') {
    issues.push({ field: 'description', message: 'La descripción debe ser texto' });
  }

  if (issues.length > 0) {
    throw new ValidationError(issues);
  }

  return {
    name: name as string,
    ...(typeof slug === 'string' ? { slug } : {}),
    description: typeof description === 'string' ? description : null,
  };
}

/** Estructura del JSON de PATCH /api/categorias/:id. Todos los campos son opcionales (≥ 1). */
export function parseUpdateCategoryBody(body: unknown): UpdateCategoryInput {
  const record = requireJsonObject(body);
  const issues: ValidationIssue[] = [];
  checkFields(record, issues);

  const keys = Object.keys(record);
  if (keys.length === 0) {
    issues.push({ field: 'body', message: 'Debes enviar al menos un campo para actualizar' });
  }

  const { name, slug, description } = record;
  const input: UpdateCategoryInput = {};

  if (name !== undefined) {
    if (typeof name === 'string') input.name = name;
    else issues.push({ field: 'name', message: 'El nombre debe ser texto' });
  }
  if (slug !== undefined) {
    if (typeof slug === 'string') input.slug = slug;
    else issues.push({ field: 'slug', message: 'El slug debe ser texto' });
  }
  if (description !== undefined) {
    if (description === null || typeof description === 'string') input.description = description;
    else issues.push({ field: 'description', message: 'La descripción debe ser texto' });
  }

  if (issues.length > 0) {
    throw new ValidationError(issues);
  }
  return input;
}
