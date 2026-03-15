import { DomainException } from '@shared/common/kernel/domain-exception';

export class UsernameTakenException extends DomainException {
  constructor(message = 'This username is already taken.') {
    super('USER_USERNAME_TAKEN', message);
  }
}
