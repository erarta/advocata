import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import {
  PAYMENT_JOB_TYPES,
  ProcessPaymentJobData,
  VerifyPaymentStatusJobData,
  ProcessRefundJobData,
  ProcessPayoutJobData,
  SubscriptionRenewalJobData,
  PaymentReminderJobData,
} from '../jobs/payment.jobs';
import { QUEUE_NAMES } from '../interfaces/job-options.interface';

@Processor(QUEUE_NAMES.PAYMENTS, {
  concurrency: 3, // Limited concurrency for payment operations
})
@Injectable()
export class PaymentProcessor extends WorkerHost {
  private readonly logger = new Logger(PaymentProcessor.name);

  async process(job: Job): Promise<any> {
    this.logger.log(
      `Processing payment job ${job.id} of type ${job.name} (attempt ${job.attemptsMade + 1}/${job.opts.attempts})`,
    );

    try {
      switch (job.name) {
        case PAYMENT_JOB_TYPES.PROCESS_PAYMENT:
          return await this.handleProcessPayment(job as Job<ProcessPaymentJobData>);

        case PAYMENT_JOB_TYPES.VERIFY_PAYMENT_STATUS:
          return await this.handleVerifyPaymentStatus(
            job as Job<VerifyPaymentStatusJobData>,
          );

        case PAYMENT_JOB_TYPES.PROCESS_REFUND:
          return await this.handleProcessRefund(job as Job<ProcessRefundJobData>);

        case PAYMENT_JOB_TYPES.PROCESS_PAYOUT:
          return await this.handleProcessPayout(job as Job<ProcessPayoutJobData>);

        case PAYMENT_JOB_TYPES.SUBSCRIPTION_RENEWAL:
          return await this.handleSubscriptionRenewal(
            job as Job<SubscriptionRenewalJobData>,
          );

        case PAYMENT_JOB_TYPES.PAYMENT_REMINDER:
          return await this.handlePaymentReminder(
            job as Job<PaymentReminderJobData>,
          );

        default:
          this.logger.warn(`Unknown payment job type: ${job.name}`);
          throw new Error(`Unknown payment job type: ${job.name}`);
      }
    } catch (error) {
      this.logger.error(
        `Error processing payment job ${job.id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async handleProcessPayment(
    job: Job<ProcessPaymentJobData>,
  ): Promise<void> {
    const { paymentId } = job.data;

    this.logger.log(`Processing payment ${paymentId}`);

    // TODO: Integrate with payment module/service
    await job.updateProgress(50);

    this.logger.log(`Payment ${paymentId} processed successfully`);
    await job.updateProgress(100);
  }

  private async handleVerifyPaymentStatus(
    job: Job<VerifyPaymentStatusJobData>,
  ): Promise<void> {
    const { paymentId, attemptCount = 0 } = job.data;

    this.logger.log(
      `Verifying payment status for ${paymentId} (attempt ${attemptCount})`,
    );

    // TODO: Check payment status with ЮКасса
    // If still pending and attempts < max, re-queue
    await job.updateProgress(100);

    this.logger.log(`Payment status verified for ${paymentId}`);
  }

  private async handleProcessRefund(
    job: Job<ProcessRefundJobData>,
  ): Promise<void> {
    const { refundId, reason } = job.data;

    this.logger.log(`Processing refund ${refundId}. Reason: ${reason || 'N/A'}`);

    // TODO: Process refund via ЮКасса
    await job.updateProgress(50);

    this.logger.log(`Refund ${refundId} processed successfully`);
    await job.updateProgress(100);
  }

  private async handleProcessPayout(
    job: Job<ProcessPayoutJobData>,
  ): Promise<void> {
    const { lawyerId, amount, period } = job.data;

    this.logger.log(
      `Processing payout for lawyer ${lawyerId}: ${amount} RUB for period ${period.startDate.toISOString()} to ${period.endDate.toISOString()}`,
    );

    // TODO: Calculate and process payout
    await job.updateProgress(50);

    this.logger.log(`Payout processed successfully for lawyer ${lawyerId}`);
    await job.updateProgress(100);
  }

  private async handleSubscriptionRenewal(
    job: Job<SubscriptionRenewalJobData>,
  ): Promise<void> {
    const { subscriptionId } = job.data;

    this.logger.log(`Processing subscription renewal for ${subscriptionId}`);

    // TODO: Charge subscription via ЮКасса
    await job.updateProgress(50);

    this.logger.log(`Subscription ${subscriptionId} renewed successfully`);
    await job.updateProgress(100);
  }

  private async handlePaymentReminder(
    job: Job<PaymentReminderJobData>,
  ): Promise<void> {
    const { consultationId, clientId, amount } = job.data;

    this.logger.log(
      `Sending payment reminder for consultation ${consultationId} to client ${clientId}`,
    );

    // TODO: Send notification via notification queue
    await job.updateProgress(100);

    this.logger.log(`Payment reminder sent for consultation ${consultationId}`);
  }
}
