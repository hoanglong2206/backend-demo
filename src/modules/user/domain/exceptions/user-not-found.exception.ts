import { DomainException } from '@shared/common/kernel/domain-exception';

export class UserNotFoundException extends DomainException {
  constructor(message = 'User not found.') {
    super('USER_NOT_FOUND', message);
  }
}
