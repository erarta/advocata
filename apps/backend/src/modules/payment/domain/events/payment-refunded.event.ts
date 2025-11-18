import { DomainEvent } from '@/shared/domain/domain-event';

/**
 * Payment Refunded Event Properties
 */
export interface PaymentRefundedEventProps {
  paymentId: string;
  refundId: string;
  userId: string;
  consultationId?: string;
  refundedAmount: number;
  currency: string;
  reason?: string;
  refundedAt: Date;
  occurredAt: Date;
}

/**
 * Payment Refunded Event
 *
 * Published when a payment is refunded (full or partial).
 * Triggers user notification and consultation status update.
 */
export class PaymentRefundedEvent implements DomainEvent {
  public readonly _type = 'PaymentRefundedEvent';
  public readonly occurredAt: Date;

  constructor(public readonly props: PaymentRefundedEventProps) {
    this.occurredAt = props.occurredAt;
  }

  get paymentId(): string {
    return this.props.paymentId;
  }

  get refundId(): string {
    return this.props.refundId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get consultationId(): string | undefined {
    return this.props.consultationId;
  }

  get refundedAmount(): number {
    return this.props.refundedAmount;
  }

  get currency(): string {
    return this.props.currency;
  }

  get reason(): string | undefined {
    return this.props.reason;
  }

  get refundedAt(): Date {
    return this.props.refundedAt;
  }
}
