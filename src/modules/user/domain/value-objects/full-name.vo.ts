import { ValueObject } from '@shared/common/kernel/value-object';
import { Result } from '@shared/common/kernel/result';

interface FullNameProps {
  value: string;
}

export class FullName extends ValueObject<FullNameProps> {
  private static readonly MAX_LENGTH = 256;

  private constructor(props: FullNameProps) {
    super(props);
  }

  static create(fullName: string): Result<FullName, string> {
    const normalized = fullName.trim();

    if (!normalized) {
      return Result.fail('Full name must not be empty.');
    }

    if (normalized.length > FullName.MAX_LENGTH) {
      return Result.fail(
        `Full name must not exceed ${FullName.MAX_LENGTH} characters.`,
      );
    }

    return Result.ok(new FullName({ value: normalized }));
  }

  get value(): string {
    return this.props.value;
  }

  get firstName(): string {
    const parts = this.props.value.split(' ');
    return parts[0] || '';
  }

  get lastName(): string {
    const parts = this.props.value.split(' ');
    return parts.length > 1 ? parts[parts.length - 1] : '';
  }

  protected validateProps(props: FullNameProps): void {
    if (!props.value || props.value.trim() === '') {
      throw new Error('Invalid full name provided to FullName value object.');
    }
  }
}
