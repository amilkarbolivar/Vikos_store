/**
 * Puerto para hashear y verificar contraseñas.
 *
 * El dominio no sabe QUÉ algoritmo se usa; solo necesita estas dos operaciones.
 * Así el algoritmo puede cambiar (scrypt, argon2, bcrypt) sin tocar los casos de
 * uso. La implementación actual está en
 * `infrastructure/scrypt-password-hasher.ts`.
 */

export interface PasswordHasher {
  /** Devuelve un hash autocontenido (incluye sal y parámetros). */
  hash(plainPassword: string): Promise<string>;
  /** Compara en tiempo constante. Devuelve `false` si el hash está mal formado. */
  verify(plainPassword: string, storedHash: string): Promise<boolean>;
}
