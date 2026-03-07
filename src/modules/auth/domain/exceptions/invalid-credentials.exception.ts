import { DomainException } from '@shared/common/kernel/domain-exception';

export class InvalidCredentialsException extends DomainException {
  constructor(message = 'Invalid email or password.') {
    super('AUTH_INVALID_CREDENTIALS', message);
  }
}
