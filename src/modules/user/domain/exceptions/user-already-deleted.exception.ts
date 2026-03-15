import { DomainException } from '@shared/common/kernel/domain-exception';

export class UserAlreadyDeletedException extends DomainException {
  constructor(message = 'User has already been deleted.') {
    super('USER_ALREADY_DELETED', message);
  }
}
