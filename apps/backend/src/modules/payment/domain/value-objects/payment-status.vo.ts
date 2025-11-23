/**
 * Payment Status Value Object
 *
 * Represents the current status of a payment in its lifecycle.
 * Aligns with YooKassa payment statuses.
 */
export enum PaymentStatus {
  /**
   * Payment is being created (client-side)
   */
  PENDING = 'pending',

  /**
   * Waiting for payment capture (for two-step payments)
   */
  WAITING_FOR_CAPTURE = 'waiting_for_capture',

  /**
   * Payment successfully completed
   */
  SUCCEEDED = 'succeeded',

  /**
   * Payment was canceled (by user or timeout)
   */
  CANCELED = 'canceled',

  /**
   * Payment failed (insufficient funds, card declined, etc.)
   */
  FAILED = 'failed',

  /**
   * Payment was refunded (partial or full)
   */
  REFUNDED = 'refunded',
}

/**
 * Type guard to check if a string is a valid PaymentStatus
 */
export function isValidPaymentStatus(value: string): value is PaymentStatus {
  return Object.values(PaymentStatus).includes(value as PaymentStatus);
}

/**
 * Get display name for payment status (Russian)
 */
export function getPaymentStatusDisplayName(status: PaymentStatus): string {
  const displayNames: Record<PaymentStatus, string> = {
    [PaymentStatus.PENDING]: 'Ожидает оплаты',
    [PaymentStatus.WAITING_FOR_CAPTURE]: 'Ожидает подтверждения',
    [PaymentStatus.SUCCEEDED]: 'Оплачено',
    [PaymentStatus.CANCELED]: 'Отменено',
    [PaymentStatus.FAILED]: 'Ошибка оплаты',
    [PaymentStatus.REFUNDED]: 'Возвращено',
  };

  return displayNames[status];
}

/**
 * Check if status is final (terminal state)
 */
export function isFinalStatus(status: PaymentStatus): boolean {
  return [
    PaymentStatus.SUCCEEDED,
    PaymentStatus.CANCELED,
    PaymentStatus.FAILED,
    PaymentStatus.REFUNDED,
  ].includes(status);
}

/**
 * Check if payment can be captured
 */
export function canBeCaptured(status: PaymentStatus): boolean {
  return status === PaymentStatus.WAITING_FOR_CAPTURE;
}

/**
 * Check if payment can be canceled
 */
export function canBeCanceled(status: PaymentStatus): boolean {
  return [PaymentStatus.PENDING, PaymentStatus.WAITING_FOR_CAPTURE].includes(
    status,
  );
}

/**
 * Check if payment can be refunded
 */
export function canBeRefunded(status: PaymentStatus): boolean {
  return status === PaymentStatus.SUCCEEDED;
}
