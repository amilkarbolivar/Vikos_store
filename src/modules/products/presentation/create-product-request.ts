import { ValidationError, type ValidationIssue } from '../../shared/domain/errors';
import { parsePesosToCents } from '../../shared/domain/money';
import type { CreateProductInput } from '../application/create-product';

/**
 * Únicos campos que acepta la API. Cualquier otro (id, createdAt, updatedAt, sku, ...) se rechaza,
 * así nadie puede asignar campos internos.
 */
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
 * Valida solo la ESTRUCTURA del JSON (forma y tipos) y convierte el precio de pesos a centavos.
 * Las reglas de negocio (longitudes, UUID, URL, categoría, slug) viven en el dominio y el caso de uso.
 */
export function parseCreateProductBody(body: unknown): CreateProductInput {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new ValidationError([{ field: 'body', message: 'El cuerpo debe ser un objeto JSON' }]);
  }

  const record = body as Record<string, unknown>;
  const issues: ValidationIssue[] = [];

  for (const key of Object.keys(record)) {
    if (!ALLOWED_FIELDS.has(key)) {
      issues.push({ field: key, message: 'Campo no permitido' });
    }
  }

  const { name, slug, description, price, categoryId, imageUrl, isAvailable } = record;

  if (typeof name !== 'string') {
    issues.push({ field: 'name', message: 'El nombre es obligatorio y debe ser texto' });
  }
  if (slug != null && typeof slug !== 'string') {
    issues.push({ field: 'slug', message: 'El slug debe ser texto' });
  }
  if (description != null && typeof description !== 'string') {
    issues.push({ field: 'description', message: 'La descripción debe ser texto' });
  }
  if (typeof categoryId !== 'string') {
    issues.push({ field: 'categoryId', message: 'La categoría es obligatoria y debe ser texto' });
  }
  if (imageUrl != null && typeof imageUrl !== 'string') {
    issues.push({ field: 'imageUrl', message: 'La URL de la imagen debe ser texto' });
  }
  if (isAvailable !== undefined && typeof isAvailable !== 'boolean') {
    issues.push({ field: 'isAvailable', message: 'isAvailable debe ser verdadero o falso' });
  }

  let priceInCents = 0;
  try {
    priceInCents = parsePesosToCents(price);
  } catch (error) {
    if (error instanceof ValidationError) {
      issues.push(...error.issues);
    } else {
      throw error;
    }
  }

  if (issues.length > 0) {
    throw new ValidationError(issues);
  }

  return {
    name: name as string,
    slug: typeof slug === 'string' ? slug : undefined,
    description: typeof description === 'string' ? description : undefined,
    priceInCents,
    categoryId: categoryId as string,
    imageUrl: typeof imageUrl === 'string' ? imageUrl : null,
    isAvailable: typeof isAvailable === 'boolean' ? isAvailable : undefined,
  };
}
