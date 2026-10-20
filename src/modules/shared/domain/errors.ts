/**
 * Errores compartidos por todos los módulos.
 * Cada error lleva un `code` estable que la capa HTTP traduce a un estado HTTP.
 * Los mensajes de estos errores son seguros para mostrar al cliente.
 */
export abstract class AppError extends Error {
  abstract readonly code: string;

  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = new.target.name;
  }
}

export interface ValidationIssue {
  field: string;
  message: string;
}

export class ValidationError extends AppError {
  readonly code = 'VALIDATION_ERROR';
  readonly issues: ValidationIssue[];

  /** Varios problemas a la vez (lo usa la capa HTTP y las reglas de productos). */
  constructor(issues: ValidationIssue[]);
  /** Un solo problema: mensaje y campo (lo usan las reglas de categorías y auth). */
  constructor(message: string, field?: string);
  constructor(arg: ValidationIssue[] | string, field = 'body') {
    const issues = typeof arg === 'string' ? [{ field, message: arg }] : arg;
    super(issues.map((issue) => `${issue.field}: ${issue.message}`).join('; '));
    this.issues = issues;
  }
}

export class PayloadTooLargeError extends AppError {
  readonly code = 'PAYLOAD_TOO_LARGE';

  constructor(message = 'El cuerpo de la petición es demasiado grande') {
    super(message);
  }
}

export class UnauthorizedError extends AppError {
  readonly code = 'UNAUTHENTICATED';

  constructor(message = 'Se requiere autenticación') {
    super(message);
  }
}

export class ForbiddenError extends AppError {
  readonly code = 'FORBIDDEN';

  constructor(message = 'No tienes permisos para realizar esta acción') {
    super(message);
  }
}

/**
 * Fallo técnico (base de datos, red, etc.). Su mensaje NO se muestra al cliente;
 * la causa original queda en `cause` solo para los logs del servidor.
 */
export class InfrastructureError extends AppError {
  readonly code = 'INFRASTRUCTURE_ERROR';
}

/** Alias histórico: parte del código y de las pruebas lo importa con este nombre. */
export { AppError as DomainError };

/** El recurso pedido no existe. HTTP 404. */
export class NotFoundError extends AppError {
  readonly code = 'NOT_FOUND';

  constructor(resource: string, identifier?: string) {
    super(identifier ? `${resource} "${identifier}" no encontrado.` : `${resource} no encontrado.`);
  }
}

/** La operación choca con el estado actual (por ejemplo, un slug repetido). HTTP 409. */
export class ConflictError extends AppError {
  readonly code = 'CONFLICT';
}

/** Los datos son válidos pero una regla de negocio impide la operación. HTTP 422. */
export class BusinessRuleError extends AppError {
  readonly code = 'BUSINESS_RULE_VIOLATION';
}
