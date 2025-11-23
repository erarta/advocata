import { Injectable } from '@nestjs/common';
import { QueueService } from '../services/queue.service';
import {
  PAYMENT_JOB_TYPES,
  ProcessPaymentJobData,
  VerifyPaymentStatusJobData,
  PaymentReminderJobData,
} from '../jobs/payment.jobs';
import { HIGH_PRIORITY_JOB_OPTIONS } from '../interfaces/job-options.interface';

/**
 * Example of integrating queue system with Payment Module
 *
 * Usage in PaymentService:
 *
 * 1. Inject QueueService in your payment service constructor
 * 2. Use the methods shown below after payment operations
 */

@Injectable()
export class PaymentIntegrationExample {
  constructor(private readonly queueService: QueueService) {}

  /**
   * After creating a payment, queue it for processing
   */
  async afterPaymentCreated(paymentId: string) {
    const jobData: ProcessPaymentJobData = {
      paymentId,
      timestamp: new Date(),
    };

    await this.queueService.addPaymentJobWithHighPriority(
      PAYMENT_JOB_TYPES.PROCESS_PAYMENT,
      jobData,
    );
  }

  /**
   * Schedule recurring payment status verification
   * This will check payment status every 30 seconds for pending payments
   */
  async schedulePaymentStatusVerification(paymentId: string) {
    const jobData: VerifyPaymentStatusJobData = {
      paymentId,
      attemptCount: 0,
      timestamp: new Date(),
    };

    // Delay: 30 seconds
    await this.queueService.addPaymentJob(
      PAYMENT_JOB_TYPES.VERIFY_PAYMENT_STATUS,
      jobData,
      {
        ...HIGH_PRIORITY_JOB_OPTIONS,
        delay: 30000,
      },
    );
  }

  /**
   * Schedule payment reminder 1 hour before consultation
   */
  async schedulePaymentReminder(
    consultationId: string,
    clientId: string,
    amount: number,
    consultationTime: Date,
  ) {
    const jobData: PaymentReminderJobData = {
      consultationId,
      clientId,
      amount,
      timestamp: new Date(),
    };

    // Schedule 1 hour before consultation
    const delay = consultationTime.getTime() - Date.now() - 3600000; // 1 hour before

    if (delay > 0) {
      await this.queueService.addPaymentJob(
        PAYMENT_JOB_TYPES.PAYMENT_REMINDER,
        jobData,
        {
          ...HIGH_PRIORITY_JOB_OPTIONS,
          delay,
        },
      );
    }
  }
}
