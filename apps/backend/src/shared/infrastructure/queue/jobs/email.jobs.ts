import { BaseJobData } from '../interfaces/job-options.interface';

export interface SendWelcomeEmailJobData extends BaseJobData {
  userId: string;
  email: string;
  firstName: string;
}

export interface SendOtpEmailJobData extends BaseJobData {
  email: string;
  code: string;
  expiresAt: Date;
}

export interface SendConsultationConfirmationJobData extends BaseJobData {
  consultationId: string;
  clientEmail: string;
  lawyerName: string;
  scheduledTime: Date;
}

export interface SendPaymentReceiptJobData extends BaseJobData {
  paymentId: string;
  email: string;
  amount: number;
  description: string;
}

export interface SendWeeklyDigestJobData extends BaseJobData {
  userId: string;
  email: string;
  stats: {
    consultations: number;
    earnings?: number;
    reviews?: number;
  };
}

export const EMAIL_JOB_TYPES = {
  SEND_WELCOME_EMAIL: 'send-welcome-email',
  SEND_OTP_EMAIL: 'send-otp-email',
  SEND_CONSULTATION_CONFIRMATION: 'send-consultation-confirmation',
  SEND_PAYMENT_RECEIPT: 'send-payment-receipt',
  SEND_WEEKLY_DIGEST: 'send-weekly-digest',
} as const;

export type EmailJobType = (typeof EMAIL_JOB_TYPES)[keyof typeof EMAIL_JOB_TYPES];
