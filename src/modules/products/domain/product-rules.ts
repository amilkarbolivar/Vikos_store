import { ValidationError, type ValidationIssue } from '../../shared/domain/errors';
import { MAX_PRICE_IN_CENTS } from '../../shared/domain/money';
import { slugify } from '../../shared/domain/slug';
import { isUuid } from '../../shared/domain/uuid';
import type { NewProduct } from './product';
import type { ProductChanges } from './product-repository';

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
  const name = normalizeName(draft.name, issues);

  // Slug: el indicado (normalizado) o, si no hay, el generado desde el nombre
  const providedSlug = typeof draft.slug === 'string' ? draft.slug.trim() : '';
  const slug = slugify(providedSlug || name, PRODUCT_LIMITS.slugMax);
  if (!slug && name) {
    issues.push({ field: 'slug', message: 'No se pudo generar un slug válido' });
  }

  // Descripción (opcional)
  const description = normalizeDescription(draft.description, issues);

  // Precio en centavos
  checkPrice(draft.priceInCents, issues);

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

/** Recorta, colapsa espacios y valida largo. Devuelve '' si hubo problemas. */
function normalizeName(raw: unknown, issues: ValidationIssue[]): string {
  const name = typeof raw === 'string' ? raw.trim().replace(/\s+/g, ' ') : '';
  if (!name) {
    issues.push({ field: 'name', message: 'El nombre es obligatorio' });
  } else if (name.length > PRODUCT_LIMITS.nameMax) {
    issues.push({
      field: 'name',
      message: `El nombre no puede superar ${PRODUCT_LIMITS.nameMax} caracteres`,
    });
  }
  return name;
}

/** La descripción es opcional: ausente o nula se guarda como texto vacío. */
function normalizeDescription(raw: unknown, issues: ValidationIssue[]): string {
  if (raw == null) return '';
  if (typeof raw !== 'string') {
    issues.push({ field: 'description', message: 'La descripción debe ser texto' });
    return '';
  }
  const description = raw.trim();
  if (description.length > PRODUCT_LIMITS.descriptionMax) {
    issues.push({
      field: 'description',
      message: `La descripción no puede superar ${PRODUCT_LIMITS.descriptionMax} caracteres`,
    });
  }
  return description;
}

function checkPrice(priceInCents: unknown, issues: ValidationIssue[]): void {
  if (
    typeof priceInCents !== 'number' ||
    !Number.isSafeInteger(priceInCents) ||
    priceInCents <= 0 ||
    priceInCents > MAX_PRICE_IN_CENTS
  ) {
    issues.push({
      field: 'price',
      message: 'El precio debe ser mayor que cero y no superar el máximo permitido',
    });
  }
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

export interface ProductUpdateDraft {
  name?: string;
  slug?: string | null;
  description?: string | null;
  priceInCents?: number;
  categoryId?: string;
  /** undefined = no tocar; null o vacío = quitar la imagen; texto = reemplazarla. */
  imageUrl?: string | null;
  isAvailable?: boolean;
}

/**
 * Reglas de negocio puras para una actualización PARCIAL: solo se validan y devuelven los campos
 * enviados. Aplica exactamente las mismas reglas que `buildNewProduct`.
 *
 * `currentName` sirve para derivar el slug si se envía vacío (se prefiere el nombre nuevo).
 * Igual que al crear, la existencia/estado de la categoría y los slugs repetidos los comprueba el
 * caso de uso con los repositorios.
 */
export function buildProductChanges(draft: ProductUpdateDraft, currentName: string): ProductChanges {
  const issues: ValidationIssue[] = [];
  const changes: ProductChanges = {};

  if (draft.name !== undefined) {
    changes.name = normalizeName(draft.name, issues);
  }

  if (draft.slug !== undefined) {
    const provided = typeof draft.slug === 'string' ? draft.slug.trim() : '';
    const slug = slugify(provided || changes.name || currentName, PRODUCT_LIMITS.slugMax);
    if (slug) {
      changes.slug = slug;
    } else {
      issues.push({ field: 'slug', message: 'No se pudo generar un slug válido' });
    }
  }

  if (draft.description !== undefined) {
    changes.description = normalizeDescription(draft.description, issues);
  }

  if (draft.priceInCents !== undefined) {
    checkPrice(draft.priceInCents, issues);
    changes.priceInCents = draft.priceInCents;
  }

  if (draft.categoryId !== undefined) {
    if (isUuid(draft.categoryId)) {
      changes.categoryId = draft.categoryId;
    } else {
      issues.push({ field: 'categoryId', message: 'La categoría debe ser un UUID válido' });
    }
  }

  if (draft.imageUrl !== undefined) {
    changes.imageUrl = normalizeImageUrl(draft.imageUrl, issues);
  }

  if (draft.isAvailable !== undefined) {
    if (typeof draft.isAvailable === 'boolean') {
      changes.isAvailable = draft.isAvailable;
    } else {
      issues.push({ field: 'isAvailable', message: 'isAvailable debe ser verdadero o falso' });
    }
  }

  if (issues.length > 0) {
    throw new ValidationError(issues);
  }
  return changes;
}
