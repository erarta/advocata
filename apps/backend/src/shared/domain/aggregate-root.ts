import { Entity } from './entity';
import { DomainEvent } from './domain-event';

/**
 * Aggregate Root - main entry point to an aggregate
 *
 * Aggregates are clusters of domain objects that can be treated as a single unit.
 * The Aggregate Root is the only member of the aggregate that outside objects
 * are allowed to hold references to.
 */
export abstract class AggregateRoot<T> extends Entity<T> {
  private _domainEvents: DomainEvent[] = [];

  public get domainEvents(): DomainEvent[] {
    return this._domainEvents;
  }

  protected addDomainEvent(domainEvent: DomainEvent): void {
    this._domainEvents.push(domainEvent);
  }

  public clearEvents(): void {
    this._domainEvents = [];
  }

  /**
   * Call this method when you want to raise and dispatch domain events
   */
  protected raiseDomainEvent(event: DomainEvent): void {
    this.addDomainEvent(event);
  }
}
