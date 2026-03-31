import { UserSettings } from '@modules/user/domain/entities/user-settings.entity';
import { UserSettingsOrm } from '../orm/user-settings.orm';

/**
 * Mapper: UserSettings domain entity ↔ UserSettingsOrm persistence DTO.
 *
 * WHY: Isolates the domain model from the database schema so each
 * can evolve independently.
 */
export class UserSettingsMapper {
  /**
   * Map a persistence row to a domain entity.
   */
  static toDomain(orm: UserSettingsOrm): UserSettings {
    return UserSettings.reconstitute(
      orm.id,
      {
        userId: orm.userId,
        emailNotifications: orm.emailNotifications,
        pushNotifications: orm.pushNotifications,
        theme: orm.theme as 'light' | 'dark' | 'auto',
        language: orm.language,
        twoFactorEnabled: orm.twoFactorEnabled,
      },
      orm.createdAt,
    );
  }

  /**
   * Map a domain entity to a persistence row.
   */
  static toOrm(entity: UserSettings): UserSettingsOrm {
    return {
      id: entity.id,
      userId: entity.userId,
      emailNotifications: entity.emailNotifications,
      pushNotifications: entity.pushNotifications,
      theme: entity.theme,
      language: entity.language,
      twoFactorEnabled: entity.twoFactorEnabled,
      createdAt: entity.createdAt,
    };
  }
}
