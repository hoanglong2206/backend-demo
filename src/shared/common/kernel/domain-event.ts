/**
 * Base interface for all domain events.
 * Every event must have an occurredOn timestamp and an aggregate ID.
 */
export interface DomainEvent {
  readonly aggregateId: string;
  readonly occurredOn: Date;
  readonly eventName: string;
}

/**
 * Optional abstract class for domain events that includes common logic.
 */
export abstract class BaseDomainEvent implements DomainEvent {
  public readonly aggregateId: string;
  public readonly occurredOn: Date;
  public abstract readonly eventName: string;

  constructor(aggregateId: string) {
    this.aggregateId = aggregateId;
    this.occurredOn = new Date();
  }
}
