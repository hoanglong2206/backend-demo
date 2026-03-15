import { UserSettings } from '../entities/user-settings.entity';

/**
 * Repository interface for UserSettings entities.
 *
 * WHY: Abstracts persistence for user settings so domain services
 * can manage preferences without coupling to a specific storage mechanism.
 */
export interface IUserSettingsRepository {
  /**
   * Persist new user settings.
   */
  save(userSettings: UserSettings): Promise<void>;

  /**
   * Find user settings by their unique ID.
   */
  findById(id: string): Promise<UserSettings | null>;

  /**
   * Find user settings by user ID.
   * Each user has exactly one settings record.
   */
  findByUserId(userId: string): Promise<UserSettings | null>;

  /**
   * Update existing user settings.
   */
  update(userSettings: UserSettings): Promise<void>;

  /**
   * Delete user settings by user ID.
   * Typically used when a user account is deleted.
   */
  deleteByUserId(userId: string): Promise<void>;
}
