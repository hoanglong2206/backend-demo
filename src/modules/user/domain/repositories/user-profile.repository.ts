import { UserProfile } from '../entities/user-profile.entity';
import { Username } from '../value-objects/username.vo';

/**
 * Repository interface for UserProfile aggregate roots.
 *
 * WHY: The UserProfile is the central aggregate in the user
 * bounded context. This interface defines the persistence contract
 * so domain services and use-cases remain infrastructure-agnostic.
 */
export interface IUserProfileRepository {
  /**
   * Persist a new user profile.
   */
  save(userProfile: UserProfile): Promise<void>;

  /**
   * Find a user profile by its unique ID.
   */
  findById(id: string): Promise<UserProfile | null>;

  /**
   * Find a user profile by username.
   * Used during profile lookup and registration (uniqueness check).
   */
  findByUsername(username: Username): Promise<UserProfile | null>;

  /**
   * Update an existing user profile (e.g. after profile edits).
   */
  update(userProfile: UserProfile): Promise<void>;

  /**
   * Check whether a username is already taken.
   */
  existsByUsername(username: Username): Promise<boolean>;

  /**
   * Soft-delete a user profile by its ID.
   */
  softDelete(id: string): Promise<void>;

  /**
   * Find all active user profiles (paginated).
   */
  findActive(skip: number, take: number): Promise<UserProfile[]>;

  /**
   * Count total active user profiles.
   */
  countActive(): Promise<number>;
}
