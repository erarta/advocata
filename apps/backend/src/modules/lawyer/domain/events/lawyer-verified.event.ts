import { BaseDomainEvent } from '@shared/domain/domain-event';

/**
 * LawyerVerifiedEvent
 *
 * Raised when a lawyer is successfully verified and approved
 */
export class LawyerVerifiedEvent extends BaseDomainEvent {
  constructor(
    public readonly lawyerId: string,
    public readonly userId: string,
  ) {
    super(lawyerId);
  }
}
