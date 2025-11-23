import { DomainEvent } from '@/shared/domain/domain-event';

/**
 * Payment Created Event Properties
 */
export interface PaymentCreatedEventProps {
  paymentId: string;
  userId: string;
  consultationId?: string;
  amount: number;
  currency: string;
  occurredAt: Date;
}

/**
 * Payment Created Event
 *
 * Published when a new payment is created.
 * Triggers payment tracking and notifications.
 */
export class PaymentCreatedEvent implements DomainEvent {
  public readonly _type = 'PaymentCreatedEvent';
  public readonly occurredAt: Date;

  constructor(public readonly props: PaymentCreatedEventProps) {
    this.occurredAt = props.occurredAt;
  }

  get paymentId(): string {
    return this.props.paymentId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get consultationId(): string | undefined {
    return this.props.consultationId;
  }

  get amount(): number {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency;
  }
}
