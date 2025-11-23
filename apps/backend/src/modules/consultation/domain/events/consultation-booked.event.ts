import { DomainEvent } from '@shared/domain/domain-event';

/**
 * Consultation Booked Event
 *
 * Raised when a consultation is booked by a client
 */
export class ConsultationBookedEvent extends DomainEvent {
  constructor(
    public readonly consultationId: string,
    public readonly clientId: string,
    public readonly lawyerId: string,
    public readonly consultationType: string,
    public readonly scheduledStart?: Date,
  ) {
    super();
  }
}
