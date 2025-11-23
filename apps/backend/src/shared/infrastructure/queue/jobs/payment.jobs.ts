import { BaseJobData } from '../interfaces/job-options.interface';

export interface ProcessPaymentJobData extends BaseJobData {
  paymentId: string;
}

export interface VerifyPaymentStatusJobData extends BaseJobData {
  paymentId: string;
  attemptCount?: number;
}

export interface ProcessRefundJobData extends BaseJobData {
  refundId: string;
  reason?: string;
}

export interface ProcessPayoutJobData extends BaseJobData {
  lawyerId: string;
  amount: number;
  period: {
    startDate: Date;
    endDate: Date;
  };
}

export interface SubscriptionRenewalJobData extends BaseJobData {
  subscriptionId: string;
}

export interface PaymentReminderJobData extends BaseJobData {
  consultationId: string;
  clientId: string;
  amount: number;
}

export const PAYMENT_JOB_TYPES = {
  PROCESS_PAYMENT: 'process-payment',
  VERIFY_PAYMENT_STATUS: 'verify-payment-status',
  PROCESS_REFUND: 'process-refund',
  PROCESS_PAYOUT: 'process-payout',
  SUBSCRIPTION_RENEWAL: 'subscription-renewal',
  PAYMENT_REMINDER: 'payment-reminder',
} as const;

export type PaymentJobType =
  (typeof PAYMENT_JOB_TYPES)[keyof typeof PAYMENT_JOB_TYPES];
