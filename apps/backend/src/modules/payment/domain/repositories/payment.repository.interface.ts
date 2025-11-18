import { Payment } from '../entities/payment.entity';
import { PaymentStatus } from '../value-objects/payment-status.vo';

/**
 * Paginated result for payments
 */
export interface PaginatedPayments {
  items: Payment[];
  total: number;
}

/**
 * Payment Repository Interface
 *
 * Defines the contract for payment persistence operations.
 * Implementation is in the infrastructure layer.
 */
export interface IPaymentRepository {
  /**
   * Find payment by ID
   */
  findById(id: string): Promise<Payment | null>;

  /**
   * Find payment by YooKassa payment ID
   */
  findByYooKassaPaymentId(yooKassaPaymentId: string): Promise<Payment | null>;

  /**
   * Find payments for a user
   *
   * @param userId - User ID
   * @param status - Filter by status (optional)
   * @param limit - Maximum number of payments to return
   * @param offset - Offset for pagination
   */
  findByUserId(
    userId: string,
    status?: PaymentStatus,
    limit?: number,
    offset?: number,
  ): Promise<PaginatedPayments>;

  /**
   * Find payment for a consultation
   *
   * @param consultationId - Consultation ID
   */
  findByConsultationId(consultationId: string): Promise<Payment | null>;

  /**
   * Find payments for a subscription
   *
   * @param subscriptionId - Subscription ID
   * @param limit - Maximum number of payments to return
   * @param offset - Offset for pagination
   */
  findBySubscriptionId(
    subscriptionId: string,
    limit?: number,
    offset?: number,
  ): Promise<PaginatedPayments>;

  /**
   * Find pending payments (for timeout checking)
   *
   * @param olderThanMinutes - Find payments older than X minutes
   * @param limit - Maximum number of payments to return
   */
  findPendingPayments(
    olderThanMinutes?: number,
    limit?: number,
  ): Promise<Payment[]>;

  /**
   * Calculate total revenue for a period
   *
   * @param startDate - Start date
   * @param endDate - End date
   * @param currency - Currency (optional, defaults to RUB)
   */
  calculateRevenue(
    startDate: Date,
    endDate: Date,
    currency?: string,
  ): Promise<number>;

  /**
   * Calculate platform commission for a period
   *
   * @param startDate - Start date
   * @param endDate - End date
   * @param currency - Currency (optional, defaults to RUB)
   */
  calculatePlatformCommission(
    startDate: Date,
    endDate: Date,
    currency?: string,
  ): Promise<number>;

  /**
   * Get payment statistics for a user
   *
   * @param userId - User ID
   */
  getUserPaymentStats(userId: string): Promise<{
    totalPaid: number;
    totalConsultations: number;
    averagePayment: number;
    currency: string;
  }>;

  /**
   * Save a payment
   */
  save(payment: Payment): Promise<void>;

  /**
   * Save multiple payments (bulk operation)
   */
  saveMany(payments: Payment[]): Promise<void>;

  /**
   * Delete a payment (hard delete - use with caution)
   */
  delete(id: string): Promise<void>;

  /**
   * Count payments by status
   *
   * @param status - Payment status
   * @param startDate - Start date (optional)
   * @param endDate - End date (optional)
   */
  countByStatus(
    status: PaymentStatus,
    startDate?: Date,
    endDate?: Date,
  ): Promise<number>;
}

/**
 * Repository token for dependency injection
 */
export const PAYMENT_REPOSITORY = Symbol('IPaymentRepository');
