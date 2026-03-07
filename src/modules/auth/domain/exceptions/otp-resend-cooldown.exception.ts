import { DomainException } from '@shared/common/kernel/domain-exception';

export class OtpResendCooldownException extends DomainException {
  constructor(message = 'Please wait before requesting a new OTP code.') {
    super('AUTH_OTP_RESEND_COOLDOWN', message);
  }
}
