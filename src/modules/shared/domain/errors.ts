/**
 * Errores del dominio compartidos por todos los módulos.
 *
 * ¿Por qué existen?
 * Los casos de uso necesitan comunicar "qué salió mal" sin saber nada de HTTP,
 * Prisma o Next.js. Cada error lleva un `code` estable; la capa de presentación
 * (rutas API, Server Actions) lo traduce a un código HTTP o a un mensaje de
 * formulario. Así la regla de negocio vive en un solo lugar y cada borde
 * decide cómo mostrarla.
 *
 * Correspondencia sugerida con HTTP (se implementa en la capa de presentación):
 *   VALIDATION    -> 400
 *   NOT_FOUND     -> 404
 *   CONFLICT      -> 409
 *   BUSINESS_RULE -> 422
 *
 * Este archivo es un "shared kernel": un núcleo pequeño y estable que los
 * módulos pueden compartir sin acoplarse entre sí. No debe crecer con
 * lógica de un módulo concreto.
 */

export type DomainErrorCode = "VALIDATION" | "NOT_FOUND" | "CONFLICT" | "BUSINESS_RULE";

/** Clase base: permite capturar cualquier error de negocio con `instanceof DomainError`. */
export class DomainError extends Error {
  readonly code: DomainErrorCode;

  constructor(code: DomainErrorCode, message: string) {
    super(message);
    // `new.target.name` deja el nombre de la subclase (útil en logs y pruebas).
    this.name = new.target.name;
    this.code = code;
  }
}

/** Un dato de entrada no cumple las reglas del dominio (vacío, formato, rango...). */
export class ValidationError extends DomainError {
  /** Campo afectado, para que el formulario pueda marcarlo. */
  readonly field: string | undefined;

  constructor(message: string, field?: string) {
    super("VALIDATION", message);
    this.field = field;
  }
}

/** El recurso solicitado no existe. */
export class NotFoundError extends DomainError {
  constructor(entity: string, identifier: string) {
    super("NOT_FOUND", `${entity} no encontrado: ${identifier}`);
  }
}

/** La operación choca con el estado actual (p. ej. un slug que ya está en uso). */
export class ConflictError extends DomainError {
  constructor(message: string) {
    super("CONFLICT", message);
  }
}

/** Una regla de negocio impide la operación (p. ej. usar una categoría inactiva). */
export class BusinessRuleError extends DomainError {
  constructor(message: string) {
    super("BUSINESS_RULE", message);
  }
}
