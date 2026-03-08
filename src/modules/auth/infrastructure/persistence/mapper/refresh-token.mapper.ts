import { RefreshToken } from '@modules/auth/domain/entities/refresh-token.entity';
import { RefreshTokenOrm } from '../orm/refresh-token.orm';

/**
 * Mapper: RefreshToken domain entity ↔ RefreshTokenOrm persistence DTO.
 *
 * WHY: The domain entity has `revokedAt` and `replacedByToken` fields
 * for the token-rotation pattern, but the current DB schema does not
 * have those columns yet. This mapper maps only the columns that exist
 * today; once the schema is migrated, the mapper can be extended.
 */
export class RefreshTokenMapper {
  /**
   * Map a persistence row to a domain entity.
   *
   * Since `revokedAt` and `replacedByToken` are not in the DB yet,
   * they default to `null` (i.e. the token is treated as active).
   */
  static toDomain(orm: RefreshTokenOrm): RefreshToken {
    return RefreshToken.reconstitute(
      orm.id,
      {
        token: orm.token,
        expiresAt: orm.expiresAt,
        ipAddress: orm.ipAddress,
        userId: orm.userId,
        revokedAt: null,
        replacedByToken: null,
      },
      orm.createdAt,
    );
  }

  /**
   * Map a domain entity to a persistence row.
   *
   * `revokedAt` and `replacedByToken` are deliberately omitted
   * because they do not exist in the current DB schema.
   */
  static toOrm(entity: RefreshToken): RefreshTokenOrm {
    return {
      id: entity.id,
      token: entity.token,
      expiresAt: entity.expiresAt,
      createdAt: entity.createdAt,
      ipAddress: entity.ipAddress,
      userId: entity.userId,
    };
  }
}
