import { Injectable } from '@nestjs/common';
import { QueueService } from '../services/queue.service';
import {
  EMAIL_JOB_TYPES,
  SendWelcomeEmailJobData,
  SendOtpEmailJobData,
  SendPaymentReceiptJobData,
} from '../jobs/email.jobs';

/**
 * Example of integrating queue system with Identity/Auth Module
 *
 * Usage in IdentityService or AuthService:
 *
 * 1. Inject QueueService in your service constructor
 * 2. Use the methods shown below after user operations
 */

@Injectable()
export class EmailIntegrationExample {
  constructor(private readonly queueService: QueueService) {}

  /**
   * After user registration, send welcome email
   */
  async afterUserRegistration(userId: string, email: string, firstName: string) {
    const jobData: SendWelcomeEmailJobData = {
      userId,
      email,
      firstName,
      timestamp: new Date(),
    };

    await this.queueService.addEmailJob(EMAIL_JOB_TYPES.SEND_WELCOME_EMAIL, jobData);
  }

  /**
   * Send OTP email for authentication
   */
  async sendOtpEmail(email: string, code: string, expiresAt: Date) {
    const jobData: SendOtpEmailJobData = {
      email,
      code,
      expiresAt,
      timestamp: new Date(),
    };

    // Use critical priority for OTP emails
    await this.queueService.addCriticalEmailJob(
      EMAIL_JOB_TYPES.SEND_OTP_EMAIL,
      jobData,
    );
  }

  /**
   * Send payment receipt after successful payment
   */
  async sendPaymentReceipt(
    paymentId: string,
    email: string,
    amount: number,
    description: string,
  ) {
    const jobData: SendPaymentReceiptJobData = {
      paymentId,
      email,
      amount,
      description,
      timestamp: new Date(),
    };

    await this.queueService.addEmailJob(
      EMAIL_JOB_TYPES.SEND_PAYMENT_RECEIPT,
      jobData,
    );
  }
}
