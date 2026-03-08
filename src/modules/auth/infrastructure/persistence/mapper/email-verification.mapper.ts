import { EmailVerification } from '@modules/auth/domain/entities/email-verification.entity';
import { OtpCode } from '@modules/auth/domain/value-objects/otp-code.vo';
import { EmailVerificationOrm } from '../orm/email-verification.orm';

/**
 * Mapper: EmailVerification domain entity ↔ EmailVerificationOrm persistence DTO.
 *
 * WHY: The domain entity uses an OtpCode value object while the DB
 * stores the code in a plain `token` column. This mapper bridges that gap.
 */
export class EmailVerificationMapper {
  /**
   * Map a persistence row to a domain entity.
   */
  static toDomain(orm: EmailVerificationOrm): EmailVerification {
    const otpResult = OtpCode.create(orm.token, orm.expiresAt);
    if (otpResult.isFailure()) {
      throw new Error(
        `Failed to reconstitute OtpCode from persistence: ${otpResult.getError()}`,
      );
    }

    return EmailVerification.reconstitute(
      orm.id,
      {
        email: orm.email,
        otpCode: otpResult.getValue(),
        verifiedAt: orm.verifiedAt,
        ipAddress: orm.ipAddress,
        userId: orm.userId,
      },
      orm.createdAt,
    );
  }

  /**
   * Map a domain entity to a persistence row.
   */
  static toOrm(entity: EmailVerification): EmailVerificationOrm {
    return {
      id: entity.id,
      email: entity.email,
      token: entity.otpCode.value,
      expiresAt: entity.expiresAt,
      verifiedAt: entity.verifiedAt,
      createdAt: entity.createdAt,
      ipAddress: entity.ipAddress,
      userId: entity.userId,
    };
  }
}
