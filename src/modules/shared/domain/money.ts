import { ValidationError } from './errors';

/**
 * Representaciones del precio:
 *  - API:            pesos colombianos (number o string, hasta 2 decimales) -> 85000 | "85000.50"
 *  - Dominio:        centavos enteros                                       -> 8500000
 *  - PostgreSQL:     NUMERIC(12,2) en pesos                                 -> "85000.00"
 *
 * Todas las conversiones se hacen con enteros y texto, nunca con multiplicaciones
 * en coma flotante, para evitar errores como 19.99 * 100 = 1998.9999999999998.
 */

/** NUMERIC(12,2) admite como máximo 9.999.999.999,99 pesos. */
export const MAX_PRICE_IN_CENTS = 999_999_999_999;

const PESOS_PATTERN = /^(\d{1,10})(?:\.(\d{1,2}))?$/;
const DECIMAL_PATTERN = /^(\d+)(?:\.(\d+))?$/;

function invalidPrice(message: string): ValidationError {
  return new ValidationError([{ field: 'price', message }]);
}

/** Convierte el precio recibido por la API (pesos) a centavos enteros. */
export function parsePesosToCents(value: unknown): number {
  let text: string;

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw invalidPrice('El precio debe ser un número finito');
    }
    text = String(value);
  } else if (typeof value === 'string') {
    text = value.trim();
  } else {
    throw invalidPrice('El precio es obligatorio y debe ser un número');
  }

  const match = PESOS_PATTERN.exec(text);
  if (!match) {
    throw invalidPrice(
      'El precio debe ser un valor positivo en pesos, con máximo 2 decimales y sin notación científica',
    );
  }

  const cents = Number(match[1]) * 100 + Number((match[2] ?? '').padEnd(2, '0'));

  if (cents <= 0) {
    throw invalidPrice('El precio debe ser mayor que cero');
  }
  if (cents > MAX_PRICE_IN_CENTS) {
    throw invalidPrice('El precio supera el máximo permitido');
  }

  return cents;
}

/** Centavos enteros -> texto decimal para una columna NUMERIC(12,2). */
export function centsToDecimalString(cents: number): string {
  if (!Number.isSafeInteger(cents) || cents < 0 || cents > MAX_PRICE_IN_CENTS) {
    throw new RangeError('Los centavos deben ser un entero entre 0 y el máximo permitido');
  }
  const pesos = Math.floor(cents / 100);
  const rest = String(cents % 100).padStart(2, '0');
  return `${pesos}.${rest}`;
}

/** Texto decimal de NUMERIC(12,2) (por ejemplo "85000" o "85000.5") -> centavos enteros. */
export function decimalStringToCents(text: string): number {
  const match = DECIMAL_PATTERN.exec(text.trim());
  if (!match) {
    throw new RangeError('Valor decimal inválido');
  }
  const fraction = match[2] ?? '';
  if (fraction.length > 2 && /[1-9]/.test(fraction.slice(2))) {
    throw new RangeError('El valor tiene más de 2 decimales significativos');
  }
  const cents = Number(match[1]) * 100 + Number(fraction.slice(0, 2).padEnd(2, '0'));
  if (!Number.isSafeInteger(cents)) {
    throw new RangeError('Valor fuera de rango');
  }
  return cents;
}
