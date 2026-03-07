import { DomainException } from '@shared/common/kernel/domain-exception';

export class EmailAlreadyVerifiedException extends DomainException {
  constructor(message = 'Email address has already been verified.') {
    super('AUTH_EMAIL_ALREADY_VERIFIED', message);
  }
}
