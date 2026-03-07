import { DomainException } from '@shared/common/kernel/domain-exception';

export class TokenReuseDetectedException extends DomainException {
  constructor(
    message = 'Refresh token reuse detected. All sessions have been revoked for security.',
  ) {
    super('AUTH_TOKEN_REUSE_DETECTED', message);
  }
}
