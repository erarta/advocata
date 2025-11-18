import { DomainEvent } from '@/shared/domain/domain-event';

/**
 * Payment Completed Event Properties
 */
export interface PaymentCompletedEventProps {
  paymentId: string;
  userId: string;
  consultationId?: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  completedAt: Date;
  occurredAt: Date;
}

/**
 * Payment Completed Event
 *
 * Published when a payment is successfully completed.
 * Triggers consultation activation and receipt generation.
 */
export class PaymentCompletedEvent implements DomainEvent {
  public readonly _type = 'PaymentCompletedEvent';
  public readonly occurredAt: Date;

  constructor(public readonly props: PaymentCompletedEventProps) {
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

  get paymentMethod(): string {
    return this.props.paymentMethod;
  }

  get completedAt(): Date {
    return this.props.completedAt;
  }
}
