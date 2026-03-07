import { PasswordHash } from '../value-objects/password-hash.vo';

/**
 * Domain service interface for password hashing.
 *
 * WHY: Decouples the domain from any specific hashing algorithm
 * (bcrypt, argon2, scrypt). The domain only knows it needs to
 * hash and verify passwords — the infrastructure decides how.
 */
export interface IPasswordHasherService {
  /**
   * Hash a plain-text password and return a PasswordHash value object.
   */
  hash(plainPassword: string): Promise<PasswordHash>;

  /**
   * Verify a plain-text password against an existing hash.
   */
  verify(plainPassword: string, passwordHash: PasswordHash): Promise<boolean>;
}
