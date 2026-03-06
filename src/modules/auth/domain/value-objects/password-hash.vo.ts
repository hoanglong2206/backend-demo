import * as bcrypt from 'bcrypt';
import { ValueObject } from '@shared/common/kernel/value-object';
import { Result } from '@shared/common/kernel/result';

interface PasswordHashProps {
  value: string;
}

export class PasswordHash extends ValueObject<PasswordHashProps> {
  private static readonly SALT_ROUNDS = 12;
  private static readonly MIN_PASSWORD_LENGTH = 8;
  private static readonly MAX_PASSWORD_LENGTH = 128;
  private static readonly BCRYPT_HASH_REGEX = /^\$2[aby]?\$\d{1,2}\$.{53}$/;

  private constructor(props: PasswordHashProps) {
    super(props);
  }

  static async create(
    plainPassword: string,
  ): Promise<Result<PasswordHash, string>> {
    if (!plainPassword) {
      return Result.fail('Password must not be empty.');
    }

    if (plainPassword.length < PasswordHash.MIN_PASSWORD_LENGTH) {
      return Result.fail(
        `Password must be at least ${PasswordHash.MIN_PASSWORD_LENGTH} characters.`,
      );
    }

    if (plainPassword.length > PasswordHash.MAX_PASSWORD_LENGTH) {
      return Result.fail(
        `Password must not exceed ${PasswordHash.MAX_PASSWORD_LENGTH} characters.`,
      );
    }

    const hash = await bcrypt.hash(plainPassword, PasswordHash.SALT_ROUNDS);
    return Result.ok(new PasswordHash({ value: hash }));
  }

  static fromHash(hash: string): Result<PasswordHash, string> {
    if (!hash || !PasswordHash.BCRYPT_HASH_REGEX.test(hash)) {
      return Result.fail('Invalid password hash format.');
    }
    return Result.ok(new PasswordHash({ value: hash }));
  }

  async compare(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.props.value);
  }

  get value(): string {
    return this.props.value;
  }

  protected validateProps(props: PasswordHashProps): void {
    if (!props.value) {
      throw new Error('Invalid hash provided to PasswordHash value object.');
    }
  }
}
