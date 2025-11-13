import { BaseDomainEvent } from '@shared/domain/domain-event';

/**
 * LawyerRatedEvent
 *
 * Raised when a lawyer receives a new rating/review
 */
export class LawyerRatedEvent extends BaseDomainEvent {
  constructor(
    public readonly lawyerId: string,
    public readonly newRating: number,
    public readonly averageRating: number,
  ) {
    super(lawyerId);
  }
}
