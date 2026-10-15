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

  constructor(readonly issues: ValidationIssue[]) {
    super(issues.map((issue) => `${issue.field}: ${issue.message}`).join('; '));
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
