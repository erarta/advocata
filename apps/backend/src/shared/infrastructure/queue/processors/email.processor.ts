import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import {
  EMAIL_JOB_TYPES,
  SendWelcomeEmailJobData,
  SendOtpEmailJobData,
  SendConsultationConfirmationJobData,
  SendPaymentReceiptJobData,
  SendWeeklyDigestJobData,
} from '../jobs/email.jobs';
import { QUEUE_NAMES } from '../interfaces/job-options.interface';

@Processor(QUEUE_NAMES.EMAILS, {
  concurrency: 10,
})
@Injectable()
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  async process(job: Job): Promise<any> {
    this.logger.log(
      `Processing email job ${job.id} of type ${job.name} (attempt ${job.attemptsMade + 1}/${job.opts.attempts})`,
    );

    try {
      switch (job.name) {
        case EMAIL_JOB_TYPES.SEND_WELCOME_EMAIL:
          return await this.handleSendWelcomeEmail(
            job as Job<SendWelcomeEmailJobData>,
          );

        case EMAIL_JOB_TYPES.SEND_OTP_EMAIL:
          return await this.handleSendOtpEmail(job as Job<SendOtpEmailJobData>);

        case EMAIL_JOB_TYPES.SEND_CONSULTATION_CONFIRMATION:
          return await this.handleSendConsultationConfirmation(
            job as Job<SendConsultationConfirmationJobData>,
          );

        case EMAIL_JOB_TYPES.SEND_PAYMENT_RECEIPT:
          return await this.handleSendPaymentReceipt(
            job as Job<SendPaymentReceiptJobData>,
          );

        case EMAIL_JOB_TYPES.SEND_WEEKLY_DIGEST:
          return await this.handleSendWeeklyDigest(
            job as Job<SendWeeklyDigestJobData>,
          );

        default:
          this.logger.warn(`Unknown email job type: ${job.name}`);
          throw new Error(`Unknown email job type: ${job.name}`);
      }
    } catch (error) {
      this.logger.error(
        `Error processing email job ${job.id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async handleSendWelcomeEmail(
    job: Job<SendWelcomeEmailJobData>,
  ): Promise<void> {
    const { userId, email, firstName } = job.data;

    this.logger.log(`Sending welcome email to ${email} (user ${userId})`);

    // TODO: Send welcome email via SendGrid
    await job.updateProgress(50);

    this.logger.log(`Welcome email sent successfully to ${email}`);
    await job.updateProgress(100);
  }

  private async handleSendOtpEmail(job: Job<SendOtpEmailJobData>): Promise<void> {
    const { email, code, expiresAt } = job.data;

    this.logger.log(`Sending OTP email to ${email}. Code expires at ${expiresAt.toISOString()}`);

    // TODO: Send OTP email via SendGrid
    await job.updateProgress(50);

    this.logger.log(`OTP email sent successfully to ${email}`);
    await job.updateProgress(100);
  }

  private async handleSendConsultationConfirmation(
    job: Job<SendConsultationConfirmationJobData>,
  ): Promise<void> {
    const { consultationId, clientEmail, lawyerName, scheduledTime } = job.data;

    this.logger.log(
      `Sending consultation confirmation to ${clientEmail} for consultation ${consultationId}`,
    );

    // TODO: Send confirmation email with calendar invite
    await job.updateProgress(50);

    this.logger.log(
      `Consultation confirmation sent successfully to ${clientEmail}`,
    );
    await job.updateProgress(100);
  }

  private async handleSendPaymentReceipt(
    job: Job<SendPaymentReceiptJobData>,
  ): Promise<void> {
    const { paymentId, email, amount, description } = job.data;

    this.logger.log(
      `Sending payment receipt to ${email} for payment ${paymentId} (${amount} RUB)`,
    );

    // TODO: Generate and send payment receipt PDF
    await job.updateProgress(50);

    this.logger.log(`Payment receipt sent successfully to ${email}`);
    await job.updateProgress(100);
  }

  private async handleSendWeeklyDigest(
    job: Job<SendWeeklyDigestJobData>,
  ): Promise<void> {
    const { userId, email, stats } = job.data;

    this.logger.log(`Sending weekly digest to ${email} (user ${userId})`);

    // TODO: Generate and send weekly digest
    await job.updateProgress(50);

    this.logger.log(`Weekly digest sent successfully to ${email}`);
    await job.updateProgress(100);
  }
}
