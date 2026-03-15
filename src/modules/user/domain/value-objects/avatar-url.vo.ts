import { ValueObject } from '@shared/common/kernel/value-object';
import { Result } from '@shared/common/kernel/result';

interface AvatarUrlProps {
  value: string | null;
}

export class AvatarUrl extends ValueObject<AvatarUrlProps> {
  private static readonly URL_REGEX =
    /^(https?:\/\/)[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)$/;
  private static readonly MAX_LENGTH = 2048;

  private constructor(props: AvatarUrlProps) {
    super(props);
  }

  static create(avatarUrl: string | null): Result<AvatarUrl, string> {
    if (avatarUrl === null) {
      return Result.ok(new AvatarUrl({ value: null }));
    }

    const normalized = avatarUrl.trim();

    if (normalized === '') {
      return Result.ok(new AvatarUrl({ value: null }));
    }

    if (normalized.length > AvatarUrl.MAX_LENGTH) {
      return Result.fail(
        `Avatar URL must not exceed ${AvatarUrl.MAX_LENGTH} characters.`,
      );
    }

    if (!AvatarUrl.URL_REGEX.test(normalized)) {
      return Result.fail('Avatar URL format is invalid.');
    }

    return Result.ok(new AvatarUrl({ value: normalized }));
  }

  get value(): string | null {
    return this.props.value;
  }

  isSet(): boolean {
    return this.props.value !== null && this.props.value !== '';
  }

  protected validateProps(props: AvatarUrlProps): void {
    if (
      props.value !== null &&
      (props.value === '' || !AvatarUrl.URL_REGEX.test(props.value))
    ) {
      throw new Error('Invalid avatar URL provided to AvatarUrl value object.');
    }
  }
}
