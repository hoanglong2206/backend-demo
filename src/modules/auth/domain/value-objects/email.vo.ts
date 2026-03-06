import { ValueObject } from '@shared/common/kernel/value-object';
import { Result } from '@shared/common/kernel/result';

interface EmailProps {
  value: string;
}

export class Email extends ValueObject<EmailProps> {
  private static readonly EMAIL_REGEX =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  private static readonly MAX_LENGTH = 255;

  private constructor(props: EmailProps) {
    super(props);
  }

  static create(email: string): Result<Email, string> {
    const normalized = email.trim().toLowerCase();

    if (!normalized) {
      return Result.fail('Email must not be empty.');
    }

    if (normalized.length > Email.MAX_LENGTH) {
      return Result.fail(
        `Email must not exceed ${Email.MAX_LENGTH} characters.`,
      );
    }

    if (!Email.EMAIL_REGEX.test(normalized)) {
      return Result.fail('Email format is invalid.');
    }

    return Result.ok(new Email({ value: normalized }));
  }

  get value(): string {
    return this.props.value;
  }

  get domain(): string {
    return this.props.value.split('@')[1];
  }

  get localPart(): string {
    return this.props.value.split('@')[0];
  }

  protected validateProps(props: EmailProps): void {
    if (!props.value || !Email.EMAIL_REGEX.test(props.value)) {
      throw new Error('Invalid email provided to Email value object.');
    }
  }
}
