import { ValidationError, type ValidationIssue } from '../../shared/domain/errors';
import { MAX_PRICE_IN_CENTS } from '../../shared/domain/money';
import { slugify } from '../../shared/domain/slug';
import { isUuid } from '../../shared/domain/uuid';
import type { NewProduct } from './product';

/** Límites alineados con las columnas de PostgreSQL (name VARCHAR(180), slug VARCHAR(200)). */
export const PRODUCT_LIMITS = {
  nameMax: 180,
  slugMax: 200,
  descriptionMax: 2000,
  imageUrlMax: 2048,
} as const;

export interface ProductDraft {
  name: string;
  slug?: string | null;
  description?: string | null;
  priceInCents: number;
  categoryId: string;
  imageUrl?: string | null;
  isAvailable?: boolean;
}

/**
 * Reglas de negocio puras sobre los datos de un producto nuevo.
 * Normaliza los valores y acumula TODOS los problemas antes de lanzar un único ValidationError.
 * No consulta la base de datos: la existencia de la categoría y los slugs duplicados
 * los comprueba el caso de uso con los repositorios.
 */
export function buildNewProduct(draft: ProductDraft): NewProduct {
  const issues: ValidationIssue[] = [];

  // Nombre
  const name = typeof draft.name === 'string' ? draft.name.trim().replace(/\s+/g, ' ') : '';
  if (!name) {
    issues.push({ field: 'name', message: 'El nombre es obligatorio' });
  } else if (name.length > PRODUCT_LIMITS.nameMax) {
    issues.push({
      field: 'name',
      message: `El nombre no puede superar ${PRODUCT_LIMITS.nameMax} caracteres`,
    });
  }

  // Slug: el indicado (normalizado) o, si no hay, el generado desde el nombre
  const providedSlug = typeof draft.slug === 'string' ? draft.slug.trim() : '';
  const slug = slugify(providedSlug || name, PRODUCT_LIMITS.slugMax);
  if (!slug && name) {
    issues.push({ field: 'slug', message: 'No se pudo generar un slug válido' });
  }

  // Descripción (opcional)
  let description = '';
  if (draft.description != null) {
    if (typeof draft.description !== 'string') {
      issues.push({ field: 'description', message: 'La descripción debe ser texto' });
    } else {
      description = draft.description.trim();
      if (description.length > PRODUCT_LIMITS.descriptionMax) {
        issues.push({
          field: 'description',
          message: `La descripción no puede superar ${PRODUCT_LIMITS.descriptionMax} caracteres`,
        });
      }
    }
  }

  // Precio en centavos
  if (
    !Number.isSafeInteger(draft.priceInCents) ||
    draft.priceInCents <= 0 ||
    draft.priceInCents > MAX_PRICE_IN_CENTS
  ) {
    issues.push({
      field: 'price',
      message: 'El precio debe ser mayor que cero y no superar el máximo permitido',
    });
  }

  // Categoría
  if (!isUuid(draft.categoryId)) {
    issues.push({ field: 'categoryId', message: 'La categoría debe ser un UUID válido' });
  }

  // Imagen (opcional)
  const imageUrl = normalizeImageUrl(draft.imageUrl, issues);

  // Disponibilidad
  let isAvailable = true;
  if (draft.isAvailable !== undefined) {
    if (typeof draft.isAvailable === 'boolean') {
      isAvailable = draft.isAvailable;
    } else {
      issues.push({ field: 'isAvailable', message: 'isAvailable debe ser verdadero o falso' });
    }
  }

  if (issues.length > 0) {
    throw new ValidationError(issues);
  }

  return {
    name,
    slug,
    description,
    priceInCents: draft.priceInCents,
    categoryId: draft.categoryId,
    imageUrl,
    isAvailable,
  };
}

function normalizeImageUrl(value: unknown, issues: ValidationIssue[]): string | null {
  if (value == null) return null;

  if (typeof value !== 'string') {
    issues.push({ field: 'imageUrl', message: 'La URL de la imagen debe ser texto' });
    return null;
  }

  const text = value.trim();
  if (!text) return null;

  if (text.length > PRODUCT_LIMITS.imageUrlMax) {
    issues.push({
      field: 'imageUrl',
      message: `La URL de la imagen no puede superar ${PRODUCT_LIMITS.imageUrlMax} caracteres`,
    });
    return null;
  }

  let url: URL;
  try {
    url = new URL(text);
  } catch {
    issues.push({ field: 'imageUrl', message: 'La URL de la imagen no es válida' });
    return null;
  }

  if ((url.protocol !== 'http:' && url.protocol !== 'https:') || url.username || url.password) {
    issues.push({
      field: 'imageUrl',
      message: 'La URL de la imagen debe usar http o https y no incluir credenciales',
    });
    return null;
  }

  return text;
}
