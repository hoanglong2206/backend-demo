import { UserCredential } from '@modules/auth/domain/entities/user-credential.entity';
import { Email } from '@modules/auth/domain/value-objects/email.vo';
import { PasswordHash } from '@modules/auth/domain/value-objects/password-hash.vo';
import { UserCredentialOrm } from '../orm/user-credential.orm';

/**
 * Mapper: UserCredential domain entity ↔ UserCredentialOrm persistence DTO.
 *
 * WHY: Isolates the domain model from the database schema so each
 * can evolve independently. The mapper handles all value-object
 * reconstitution and flattening.
 */
export class UserCredentialMapper {
  /**
   * Map a persistence row to a domain entity.
   */
  static toDomain(orm: UserCredentialOrm): UserCredential {
    const emailResult = Email.create(orm.email);
    if (emailResult.isFailure()) {
      throw new Error(
        `Failed to reconstitute Email from persistence: ${emailResult.getError()}`,
      );
    }

    let passwordHash: PasswordHash | null = null;
    if (orm.passwordHash) {
      const hashResult = PasswordHash.fromHash(orm.passwordHash);
      if (hashResult.isFailure()) {
        throw new Error(
          `Failed to reconstitute PasswordHash from persistence: ${hashResult.getError()}`,
        );
      }
      passwordHash = hashResult.getValue();
    }

    return UserCredential.reconstitute(
      orm.id,
      {
        email: emailResult.getValue(),
        emailVerified: orm.emailVerified,
        passwordHash,
        isActive: orm.isActive,
        lastLoginAt: orm.lastLoginAt,
        failedLoginCount: orm.failedLoginCount,
        lockedUntil: orm.lockedUntil,
        authProviders: orm.authProviders,
        providerId: orm.providerId,
      },
      orm.createdAt,
      orm.updatedAt,
    );
  }

  /**
   * Map a domain entity to a persistence row.
   */
  static toOrm(entity: UserCredential): UserCredentialOrm {
    return {
      id: entity.id,
      email: entity.email.value,
      emailVerified: entity.emailVerified,
      passwordHash: entity.passwordHash?.value ?? null,
      isActive: entity.isActive,
      lastLoginAt: entity.lastLoginAt,
      failedLoginCount: entity.failedLoginCount,
      lockedUntil: entity.lockedUntil,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      authProviders: entity.authProviders,
      providerId: entity.providerId,
    };
  }
}
