import { DomainException } from '@shared/common/kernel/domain-exception';

export class AccountLockedException extends DomainException {
  constructor(message = 'Account is locked due to too many failed attempts.') {
    super('AUTH_ACCOUNT_LOCKED', message);
  }
}
