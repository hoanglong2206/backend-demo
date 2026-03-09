import { Injectable } from '@nestjs/common';
import { IPasswordHasherService } from '@modules/auth/domain/services/password-hasher.service';
import { PasswordHash } from '@modules/auth/domain/value-objects/password-hash.vo';

/**
 * Bcrypt implementation of IPasswordHasherService.
 *
 * Delegates to the PasswordHash value object which already uses
 * bcrypt internally. This adapter simply satisfies the domain
 * service interface for NestJS DI.
 */
@Injectable()
export class BcryptPasswordHasherService implements IPasswordHasherService {
  async hash(plainPassword: string): Promise<PasswordHash> {
    const result = await PasswordHash.create(plainPassword);

    if (result.isFailure()) {
      throw new Error(result.getError());
    }

    return result.getValue();
  }

  async verify(
    plainPassword: string,
    passwordHash: PasswordHash,
  ): Promise<boolean> {
    return passwordHash.compare(plainPassword);
  }
}
