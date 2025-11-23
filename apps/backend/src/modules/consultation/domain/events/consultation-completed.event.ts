import { DomainEvent } from '@shared/domain/domain-event';

/**
 * Consultation Completed Event
 *
 * Raised when a consultation is completed
 */
export class ConsultationCompletedEvent extends DomainEvent {
  constructor(
    public readonly consultationId: string,
    public readonly clientId: string,
    public readonly lawyerId: string,
    public readonly actualDuration: number, // minutes
  ) {
    super();
  }
}
