import { AppError } from '../../shared/domain/errors';

export class CategoryNotFoundError extends AppError {
  readonly code = 'CATEGORY_NOT_FOUND';

  constructor(message = 'La categoría indicada no existe') {
    super(message);
  }
}

export class CategoryInactiveError extends AppError {
  readonly code = 'CATEGORY_INACTIVE';

  constructor(message = 'La categoría indicada está inactiva') {
    super(message);
  }
}

export class DuplicateSlugError extends AppError {
  readonly code = 'DUPLICATE_SLUG';

  constructor(message = 'Ya existe un producto con ese slug') {
    super(message);
  }
}

export class DuplicateSkuError extends AppError {
  readonly code = 'DUPLICATE_SKU';

  constructor(message = 'Ya existe un producto con ese SKU') {
    super(message);
  }
}

export class ProductNotFoundError extends AppError {
  readonly code = 'PRODUCT_NOT_FOUND';

  constructor(message = 'El producto no existe') {
    super(message);
  }
}
