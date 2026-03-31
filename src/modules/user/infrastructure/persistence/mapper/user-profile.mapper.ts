import { UserProfile } from '@modules/user/domain/entities/user-profile.entity';
import { Username } from '@modules/user/domain/value-objects/username.vo';
import { FullName } from '@modules/user/domain/value-objects/full-name.vo';
import { AvatarUrl } from '@modules/user/domain/value-objects/avatar-url.vo';
import { UserProfileOrm } from '../orm/user-profile.orm';

/**
 * Mapper: UserProfile domain entity ↔ UserProfileOrm persistence DTO.
 *
 * WHY: Isolates the domain model from the database schema so each
 * can evolve independently. The mapper handles all value-object
 * reconstitution and flattening.
 */
export class UserProfileMapper {
  /**
   * Map a persistence row to a domain entity.
   */
  static toDomain(orm: UserProfileOrm): UserProfile {
    const usernameResult = Username.create(orm.username);
    if (usernameResult.isFailure()) {
      throw new Error(
        `Failed to reconstitute Username from persistence: ${usernameResult.getError()}`,
      );
    }

    const fullNameResult = FullName.create(orm.fullName);
    if (fullNameResult.isFailure()) {
      throw new Error(
        `Failed to reconstitute FullName from persistence: ${fullNameResult.getError()}`,
      );
    }

    const avatarUrlResult = AvatarUrl.create(orm.avatarUrl);
    if (avatarUrlResult.isFailure()) {
      throw new Error(
        `Failed to reconstitute AvatarUrl from persistence: ${avatarUrlResult.getError()}`,
      );
    }

    return UserProfile.reconstitute(
      orm.id,
      {
        username: usernameResult.getValue(),
        fullName: fullNameResult.getValue(),
        avatarUrl: avatarUrlResult.getValue(),
      },
      orm.createdAt,
      orm.updatedAt,
      orm.deletedAt,
    );
  }

  /**
   * Map a domain entity to a persistence row.
   */
  static toOrm(entity: UserProfile): UserProfileOrm {
    return {
      id: entity.id,
      username: entity.username.value,
      fullName: entity.fullName.value,
      avatarUrl: entity.avatarUrl.value,
      deletedAt: entity.deletedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
