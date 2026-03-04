import { BaseEntity } from './base.entity';
import { DomainEvent } from './domain-event';

/**
 * Aggregate Root extends BaseEntity and manages domain events.
 * Only aggregate roots should be loaded from repositories and can publish events.
 */
export abstract class AggregateRoot extends BaseEntity {
  private _domainEvents: DomainEvent[] = [];

  get domainEvents(): ReadonlyArray<DomainEvent> {
    return this._domainEvents;
  }

  /**
   * Add a domain event to be published after transaction commit.
   */
  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  /**
   * Remove a specific domain event (if it was added by mistake).
   */
  protected removeDomainEvent(event: DomainEvent): void {
    const index = this._domainEvents.indexOf(event);
    if (index !== -1) {
      this._domainEvents.splice(index, 1);
    }
  }

  /**
   * Clear all domain events (usually after they have been published / committed).
   * Returns the cleared events for processing.
   */

  public drainDomainEvents(): DomainEvent[] {
    const events = [...this._domainEvents];
    this._domainEvents = [];
    return events;
  }

  /**
   * Clear all domain events (usually after they have been published / committed).
   */
  public clearEvents(): void {
    this._domainEvents = [];
  }
}
