import { BaseDomainEvent } from '@shared/common/kernel/domain-event';

/**
 * Queue name used for routing `UserRegisteredEvent` messages.
 */
export const USER_REGISTERED_QUEUE = 'user.registered';

/**
 * Domain event raised when a new user account is successfully created.
 *
 * Published to the queue after `UserCredential` is persisted so
 * downstream consumers can react asynchronously (e.g. prepare
 * onboarding state, send a welcome email, etc.).
 */
export class UserRegisteredEvent extends BaseDomainEvent {
  public readonly eventName = 'user.registered';
  public readonly email: string;

  constructor(aggregateId: string, email: string) {
    super(aggregateId);
    this.email = email;
  }
}
