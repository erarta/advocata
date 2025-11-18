import { DomainEvent } from '@shared/domain/domain-event';

/**
 * Consultation Rated Event
 *
 * Raised when a client rates a consultation
 */
export class ConsultationRatedEvent extends DomainEvent {
  constructor(
    public readonly consultationId: string,
    public readonly lawyerId: string,
    public readonly rating: number,
    public readonly review?: string,
  ) {
    super();
  }
}
