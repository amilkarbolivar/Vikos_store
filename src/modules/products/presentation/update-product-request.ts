import { ValidationError, type ValidationIssue } from '../../shared/domain/errors';
import { parsePesosToCents } from '../../shared/domain/money';
import { requireJsonObject } from '../../shared/presentation/read-json-body';
import type { UpdateProductInput } from '../application/update-product';

/** Mismos campos que al crear; ninguno es obligatorio, pero debe venir al menos uno. */
const ALLOWED_FIELDS = new Set([
  'name',
  'slug',
  'description',
  'price',
  'categoryId',
  'imageUrl',
  'isAvailable',
]);

/**
 * Valida solo la ESTRUCTURA del JSON de PATCH /api/productos/:id (forma y tipos) y convierte el
 * precio de pesos a centavos. Las reglas de negocio viven en el dominio y el caso de uso.
 * `description` e `imageUrl` aceptan `null` para vaciarlos.
 */
export function parseUpdateProductBody(body: unknown): UpdateProductInput {
  const record = requireJsonObject(body);
  const issues: ValidationIssue[] = [];
  const input: UpdateProductInput = {};

  const keys = Object.keys(record);
  for (const key of keys) {
    if (!ALLOWED_FIELDS.has(key)) {
      issues.push({ field: key, message: 'Campo no permitido' });
    }
  }
  if (keys.length === 0) {
    issues.push({ field: 'body', message: 'Debes enviar al menos un campo para actualizar' });
  }

  const { name, slug, description, price, categoryId, imageUrl, isAvailable } = record;

  if (name !== undefined) {
    if (typeof name === 'string') input.name = name;
    else issues.push({ field: 'name', message: 'El nombre debe ser texto' });
  }
  if (slug !== undefined) {
    if (slug === null || typeof slug === 'string') input.slug = slug;
    else issues.push({ field: 'slug', message: 'El slug debe ser texto' });
  }
  if (description !== undefined) {
    if (description === null || typeof description === 'string') input.description = description;
    else issues.push({ field: 'description', message: 'La descripción debe ser texto' });
  }
  if (categoryId !== undefined) {
    if (typeof categoryId === 'string') input.categoryId = categoryId;
    else issues.push({ field: 'categoryId', message: 'La categoría debe ser texto' });
  }
  if (imageUrl !== undefined) {
    if (imageUrl === null || typeof imageUrl === 'string') input.imageUrl = imageUrl;
    else issues.push({ field: 'imageUrl', message: 'La URL de la imagen debe ser texto' });
  }
  if (isAvailable !== undefined) {
    if (typeof isAvailable === 'boolean') input.isAvailable = isAvailable;
    else issues.push({ field: 'isAvailable', message: 'isAvailable debe ser verdadero o falso' });
  }
  if (price !== undefined) {
    try {
      input.priceInCents = parsePesosToCents(price);
    } catch (error) {
      if (error instanceof ValidationError) issues.push(...error.issues);
      else throw error;
    }
  }

  if (issues.length > 0) {
    throw new ValidationError(issues);
  }
  return input;
}
