import { DomainEvent } from '@shared/domain/domain-event';

/**
 * Consultation Confirmed Event
 *
 * Raised when a lawyer confirms a consultation
 */
export class ConsultationConfirmedEvent extends DomainEvent {
  constructor(
    public readonly consultationId: string,
    public readonly lawyerId: string,
    public readonly clientId: string,
  ) {
    super();
  }
}
