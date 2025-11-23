import { AggregateRoot } from '@/shared/domain/aggregate-root';
import { Result } from '@/shared/domain/result';
import { Money } from '../value-objects/money.vo';
import { PaymentStatus } from '../value-objects/payment-status.vo';
import { PaymentMethod } from '../value-objects/payment-method.vo';
import { PaymentCreatedEvent } from '../events/payment-created.event';
import { PaymentCompletedEvent } from '../events/payment-completed.event';
import { PaymentFailedEvent } from '../events/payment-failed.event';
import { PaymentRefundedEvent } from '../events/payment-refunded.event';

/**
 * Payment Entity Properties
 */
export interface PaymentProps {
  userId: string;
  consultationId?: string;
  subscriptionId?: string;
  amount: Money;
  status: PaymentStatus;
  method?: PaymentMethod;
  description?: string;
  yooKassaPaymentId?: string;
  yooKassaPaymentUrl?: string;
  refundedAmount?: Money;
  failureReason?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  canceledAt?: Date;
  refundedAt?: Date;
}

/**
 * Payment Entity (Aggregate Root)
 *
 * Represents a payment transaction in the system.
 * Integrates with YooKassa payment gateway.
 */
export class Payment extends AggregateRoot<PaymentProps> {
  // Platform commission (10%)
  private static readonly PLATFORM_COMMISSION = 0.10;

  // Payment timeout (15 minutes)
  private static readonly PAYMENT_TIMEOUT_MINUTES = 15;

  get userId(): string {
    return this.props.userId;
  }

  get consultationId(): string | undefined {
    return this.props.consultationId;
  }

  get subscriptionId(): string | undefined {
    return this.props.subscriptionId;
  }

  get amount(): Money {
    return this.props.amount;
  }

  get status(): PaymentStatus {
    return this.props.status;
  }

  get method(): PaymentMethod | undefined {
    return this.props.method;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get yooKassaPaymentId(): string | undefined {
    return this.props.yooKassaPaymentId;
  }

  get yooKassaPaymentUrl(): string | undefined {
    return this.props.yooKassaPaymentUrl;
  }

  get refundedAmount(): Money | undefined {
    return this.props.refundedAmount;
  }

  get failureReason(): string | undefined {
    return this.props.failureReason;
  }

  get metadata(): Record<string, any> | undefined {
    return this.props.metadata;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get completedAt(): Date | undefined {
    return this.props.completedAt;
  }

  get canceledAt(): Date | undefined {
    return this.props.canceledAt;
  }

  get refundedAt(): Date | undefined {
    return this.props.refundedAt;
  }

  /**
   * Check if payment is completed
   */
  get isCompleted(): boolean {
    return this.status === PaymentStatus.SUCCEEDED;
  }

  /**
   * Check if payment is pending
   */
  get isPending(): boolean {
    return this.status === PaymentStatus.PENDING;
  }

  /**
   * Check if payment can be captured
   */
  get canBeCaptured(): boolean {
    return this.status === PaymentStatus.WAITING_FOR_CAPTURE;
  }

  /**
   * Check if payment can be canceled
   */
  get canBeCanceled(): boolean {
    return [PaymentStatus.PENDING, PaymentStatus.WAITING_FOR_CAPTURE].includes(
      this.status,
    );
  }

  /**
   * Check if payment can be refunded
   */
  get canBeRefunded(): boolean {
    return this.status === PaymentStatus.SUCCEEDED;
  }

  /**
   * Get lawyer's payout (amount - platform commission)
   */
  get lawyerPayout(): Money {
    const commissionResult = this.amount.applyPercentage(1 - Payment.PLATFORM_COMMISSION);

    if (commissionResult.isFailure) {
      throw new Error('Failed to calculate lawyer payout');
    }

    return commissionResult.getValue();
  }

  /**
   * Get platform commission amount
   */
  get platformCommission(): Money {
    const commissionResult = this.amount.applyPercentage(Payment.PLATFORM_COMMISSION);

    if (commissionResult.isFailure) {
      throw new Error('Failed to calculate platform commission');
    }

    return commissionResult.getValue();
  }

  /**
   * Create a new Payment
   */
  public static create(
    id: string,
    userId: string,
    amount: Money,
    description?: string,
    consultationId?: string,
    subscriptionId?: string,
    metadata?: Record<string, any>,
  ): Result<Payment> {
    // Validate userId
    if (!userId || userId.trim().length === 0) {
      return Result.fail<Payment>('User ID is required');
    }

    // Validate that either consultationId or subscriptionId is provided
    if (!consultationId && !subscriptionId) {
      return Result.fail<Payment>(
        'Either consultationId or subscriptionId must be provided',
      );
    }

    // Validate amount
    if (amount.amount <= 0) {
      return Result.fail<Payment>('Payment amount must be greater than zero');
    }

    const now = new Date();

    const payment = new Payment(
      {
        userId,
        consultationId,
        subscriptionId,
        amount,
        status: PaymentStatus.PENDING,
        description,
        metadata,
        createdAt: now,
        updatedAt: now,
      },
      id,
    );

    // Publish domain event
    payment.addDomainEvent(
      new PaymentCreatedEvent({
        paymentId: payment.id,
        userId: payment.userId,
        consultationId: payment.consultationId,
        amount: payment.amount.amount,
        currency: payment.amount.currency,
        occurredAt: now,
      }),
    );

    return Result.ok<Payment>(payment);
  }

  /**
   * Set YooKassa payment details after creating payment in YooKassa
   */
  public setYooKassaDetails(
    yooKassaPaymentId: string,
    yooKassaPaymentUrl: string,
  ): Result<void> {
    if (this.status !== PaymentStatus.PENDING) {
      return Result.fail<void>('Can only set YooKassa details for pending payments');
    }

    this.props.yooKassaPaymentId = yooKassaPaymentId;
    this.props.yooKassaPaymentUrl = yooKassaPaymentUrl;
    this.props.updatedAt = new Date();

    return Result.ok<void>();
  }

  /**
   * Mark payment as waiting for capture (two-step payment)
   */
  public markAsWaitingForCapture(): Result<void> {
    if (this.status !== PaymentStatus.PENDING) {
      return Result.fail<void>('Can only mark pending payments as waiting for capture');
    }

    this.props.status = PaymentStatus.WAITING_FOR_CAPTURE;
    this.props.updatedAt = new Date();

    return Result.ok<void>();
  }

  /**
   * Complete payment (mark as succeeded)
   */
  public complete(method: PaymentMethod): Result<void> {
    if (!this.canBeCaptured && this.status !== PaymentStatus.PENDING) {
      return Result.fail<void>('Payment cannot be completed in current status');
    }

    const now = new Date();

    this.props.status = PaymentStatus.SUCCEEDED;
    this.props.method = method;
    this.props.completedAt = now;
    this.props.updatedAt = now;

    // Publish domain event
    this.addDomainEvent(
      new PaymentCompletedEvent({
        paymentId: this.id,
        userId: this.userId,
        consultationId: this.consultationId,
        amount: this.amount.amount,
        currency: this.amount.currency,
        paymentMethod: method,
        completedAt: now,
        occurredAt: now,
      }),
    );

    return Result.ok<void>();
  }

  /**
   * Fail payment
   */
  public fail(reason?: string): Result<void> {
    if (![PaymentStatus.PENDING, PaymentStatus.WAITING_FOR_CAPTURE].includes(this.status)) {
      return Result.fail<void>('Payment cannot be failed in current status');
    }

    const now = new Date();

    this.props.status = PaymentStatus.FAILED;
    this.props.failureReason = reason;
    this.props.updatedAt = now;

    // Publish domain event
    this.addDomainEvent(
      new PaymentFailedEvent({
        paymentId: this.id,
        userId: this.userId,
        consultationId: this.consultationId,
        amount: this.amount.amount,
        currency: this.amount.currency,
        reason,
        failedAt: now,
        occurredAt: now,
      }),
    );

    return Result.ok<void>();
  }

  /**
   * Cancel payment
   */
  public cancel(): Result<void> {
    if (!this.canBeCanceled) {
      return Result.fail<void>('Payment cannot be canceled in current status');
    }

    const now = new Date();

    this.props.status = PaymentStatus.CANCELED;
    this.props.canceledAt = now;
    this.props.updatedAt = now;

    return Result.ok<void>();
  }

  /**
   * Refund payment (full or partial)
   */
  public refund(refundId: string, refundAmount: Money, reason?: string): Result<void> {
    if (!this.canBeRefunded) {
      return Result.fail<void>('Payment cannot be refunded in current status');
    }

    // Validate refund amount
    if (refundAmount.currency !== this.amount.currency) {
      return Result.fail<void>('Refund currency must match payment currency');
    }

    // Check if refund amount is valid
    const totalRefunded = this.refundedAmount
      ? this.refundedAmount.amount + refundAmount.amount
      : refundAmount.amount;

    if (totalRefunded > this.amount.amount) {
      return Result.fail<void>('Refund amount exceeds payment amount');
    }

    const now = new Date();

    // Update refunded amount
    if (this.props.refundedAmount) {
      const addResult = this.props.refundedAmount.add(refundAmount);
      if (addResult.isFailure) {
        return Result.fail<void>(addResult.error);
      }
      this.props.refundedAmount = addResult.getValue();
    } else {
      this.props.refundedAmount = refundAmount;
    }

    // Check if fully refunded
    if (this.props.refundedAmount.isEqualTo(this.amount)) {
      this.props.status = PaymentStatus.REFUNDED;
      this.props.refundedAt = now;
    }

    this.props.updatedAt = now;

    // Publish domain event
    this.addDomainEvent(
      new PaymentRefundedEvent({
        paymentId: this.id,
        refundId,
        userId: this.userId,
        consultationId: this.consultationId,
        refundedAmount: refundAmount.amount,
        currency: refundAmount.currency,
        reason,
        refundedAt: now,
        occurredAt: now,
      }),
    );

    return Result.ok<void>();
  }

  /**
   * Check if payment is expired (older than timeout)
   */
  public isExpired(): boolean {
    if (this.status !== PaymentStatus.PENDING) {
      return false;
    }

    const now = new Date();
    const timeoutMs = Payment.PAYMENT_TIMEOUT_MINUTES * 60 * 1000;
    const expiresAt = new Date(this.createdAt.getTime() + timeoutMs);

    return now > expiresAt;
  }

  /**
   * Get platform commission percentage
   */
  public static getPlatformCommission(): number {
    return Payment.PLATFORM_COMMISSION;
  }

  /**
   * Get payment timeout in minutes
   */
  public static getPaymentTimeout(): number {
    return Payment.PAYMENT_TIMEOUT_MINUTES;
  }
}
