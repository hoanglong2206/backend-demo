import { ValueObject } from '@shared/common/kernel/value-object';
import { Result } from '@shared/common/kernel/result';

interface UsernameProps {
  value: string;
}

export class Username extends ValueObject<UsernameProps> {
  private static readonly USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,20}$/;
  private static readonly MIN_LENGTH = 3;
  private static readonly MAX_LENGTH = 20;

  private constructor(props: UsernameProps) {
    super(props);
  }

  static create(username: string): Result<Username, string> {
    const normalized = username.trim().toLowerCase();

    if (!normalized) {
      return Result.fail('Username must not be empty.');
    }

    if (normalized.length < Username.MIN_LENGTH) {
      return Result.fail(
        `Username must be at least ${Username.MIN_LENGTH} characters.`,
      );
    }

    if (normalized.length > Username.MAX_LENGTH) {
      return Result.fail(
        `Username must not exceed ${Username.MAX_LENGTH} characters.`,
      );
    }

    if (!Username.USERNAME_REGEX.test(normalized)) {
      return Result.fail(
        'Username can only contain letters, numbers, underscores, and hyphens.',
      );
    }

    return Result.ok(new Username({ value: normalized }));
  }

  get value(): string {
    return this.props.value;
  }

  protected validateProps(props: UsernameProps): void {
    if (!props.value || !Username.USERNAME_REGEX.test(props.value)) {
      throw new Error('Invalid username provided to Username value object.');
    }
  }
}
