import { UserCredential } from '../entities/user-credential.entity';
import { Email } from '../value-objects/email.vo';

/**
 * Repository interface for UserCredential aggregate roots.
 *
 * WHY: The UserCredential is the central aggregate in the auth
 * bounded context. This interface defines the persistence contract
 * so domain services and use-cases remain infrastructure-agnostic.
 */
export interface IUserCredentialRepository {
  /**
   * Persist a new user credential.
   */
  save(userCredential: UserCredential): Promise<void>;

  /**
   * Find a user credential by its unique ID.
   */
  findById(id: string): Promise<UserCredential | null>;

  /**
   * Find a user credential by email address.
   * Used during login and registration (duplicate check).
   */
  findByEmail(email: Email): Promise<UserCredential | null>;

  /**
   * Find a user credential by OAuth provider and provider-specific ID.
   * Used during social login flows.
   */
  findByProviderId(
    provider: string,
    providerId: string,
  ): Promise<UserCredential | null>;

  /**
   * Update an existing user credential (e.g. after login, email
   * verification, password change, or account lock).
   */
  update(userCredential: UserCredential): Promise<void>;

  /**
   * Check whether an email is already registered.
   */
  existsByEmail(email: Email): Promise<boolean>;

  /**
   * Soft-delete a user credential by its ID.
   */
  softDelete(id: string): Promise<void>;
}
