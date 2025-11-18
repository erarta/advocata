import { DomainEvent } from '@/shared/domain/domain-event';

/**
 * Payment Failed Event Properties
 */
export interface PaymentFailedEventProps {
  paymentId: string;
  userId: string;
  consultationId?: string;
  amount: number;
  currency: string;
  reason?: string;
  failedAt: Date;
  occurredAt: Date;
}

/**
 * Payment Failed Event
 *
 * Published when a payment fails.
 * Triggers user notification and consultation cancellation.
 */
export class PaymentFailedEvent implements DomainEvent {
  public readonly _type = 'PaymentFailedEvent';
  public readonly occurredAt: Date;

  constructor(public readonly props: PaymentFailedEventProps) {
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

  get reason(): string | undefined {
    return this.props.reason;
  }

  get failedAt(): Date {
    return this.props.failedAt;
  }
}
