/**
 * YooKassa Payment Response
 */
export interface YooKassaPaymentResponse {
  id: string;
  status: string;
  amount: {
    value: string;
    currency: string;
  };
  description?: string;
  paymentMethod?: string;
  confirmationUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  capturedAt?: string;
  expiresAt?: string;
}

/**
 * YooKassa Refund Response
 */
export interface YooKassaRefundResponse {
  id: string;
  paymentId: string;
  status: string;
  amount: {
    value: string;
    currency: string;
  };
  description?: string;
  createdAt: string;
}

/**
 * Create Payment Request
 */
export interface CreatePaymentRequest {
  amount: number; // Amount in kopecks
  currency: string;
  description?: string;
  metadata?: Record<string, any>;
  returnUrl?: string;
  capture?: boolean; // Auto-capture or two-step
}

/**
 * Create Refund Request
 */
export interface CreateRefundRequest {
  paymentId: string;
  amount: number; // Amount in kopecks
  description?: string;
}

/**
 * YooKassa Client Interface
 *
 * Defines the contract for YooKassa API integration.
 * Implementation uses YooKassa REST API.
 */
export interface IYooKassaClient {
  /**
   * Create a new payment
   */
  createPayment(request: CreatePaymentRequest): Promise<YooKassaPaymentResponse>;

  /**
   * Get payment details
   */
  getPayment(paymentId: string): Promise<YooKassaPaymentResponse>;

  /**
   * Capture payment (for two-step payments)
   */
  capturePayment(
    paymentId: string,
    amount?: number,
  ): Promise<YooKassaPaymentResponse>;

  /**
   * Cancel payment
   */
  cancelPayment(paymentId: string): Promise<YooKassaPaymentResponse>;

  /**
   * Create refund
   */
  createRefund(request: CreateRefundRequest): Promise<YooKassaRefundResponse>;

  /**
   * Get refund details
   */
  getRefund(refundId: string): Promise<YooKassaRefundResponse>;
}

/**
 * Dependency injection token
 */
export const YOOKASSA_CLIENT = Symbol('IYooKassaClient');
