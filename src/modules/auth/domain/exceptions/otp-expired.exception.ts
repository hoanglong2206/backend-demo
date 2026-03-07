import { DomainException } from '@shared/common/kernel/domain-exception';

export class OtpExpiredException extends DomainException {
  constructor(message = 'OTP code has expired. Please request a new one.') {
    super('AUTH_OTP_EXPIRED', message);
  }
}
