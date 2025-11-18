/**
 * Domain Event base interface
 *
 * Domain Events are used to communicate changes in the domain.
 * They represent something that happened in the domain that domain experts care about.
 */
export interface DomainEvent {
  occurredOn: Date;
  aggregateId: string;
  eventType: string;
}

/**
 * Base class for Domain Events
 */
export abstract class BaseDomainEvent implements DomainEvent {
  public readonly occurredOn: Date;
  public readonly aggregateId: string;
  public readonly eventType: string;

  constructor(aggregateId: string) {
    this.occurredOn = new Date();
    this.aggregateId = aggregateId;
    this.eventType = this.constructor.name;
  }
}
