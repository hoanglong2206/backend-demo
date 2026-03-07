import { DomainException } from '@shared/common/kernel/domain-exception';

export class OtpMaxAttemptsException extends DomainException {
  constructor(
    message = 'Maximum OTP verification attempts exceeded. Please request a new code.',
  ) {
    super('AUTH_OTP_MAX_ATTEMPTS', message);
  }
}
