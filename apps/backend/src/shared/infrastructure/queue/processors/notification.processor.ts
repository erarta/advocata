import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import {
  NOTIFICATION_JOB_TYPES,
  SendEmailJobData,
  SendSmsJobData,
  SendPushJobData,
  SendBulkEmailJobData,
} from '../jobs/notification.jobs';
import { QUEUE_NAMES } from '../interfaces/job-options.interface';

@Processor(QUEUE_NAMES.NOTIFICATIONS, {
  concurrency: 5,
})
@Injectable()
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  async process(job: Job): Promise<any> {
    this.logger.log(
      `Processing notification job ${job.id} of type ${job.name} (attempt ${job.attemptsMade + 1}/${job.opts.attempts})`,
    );

    try {
      switch (job.name) {
        case NOTIFICATION_JOB_TYPES.SEND_EMAIL:
          return await this.handleSendEmail(job as Job<SendEmailJobData>);

        case NOTIFICATION_JOB_TYPES.SEND_SMS:
          return await this.handleSendSms(job as Job<SendSmsJobData>);

        case NOTIFICATION_JOB_TYPES.SEND_PUSH:
          return await this.handleSendPush(job as Job<SendPushJobData>);

        case NOTIFICATION_JOB_TYPES.SEND_BULK_EMAIL:
          return await this.handleSendBulkEmail(job as Job<SendBulkEmailJobData>);

        default:
          this.logger.warn(`Unknown notification job type: ${job.name}`);
          throw new Error(`Unknown notification job type: ${job.name}`);
      }
    } catch (error) {
      this.logger.error(
        `Error processing notification job ${job.id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async handleSendEmail(job: Job<SendEmailJobData>): Promise<void> {
    const { email, template, data, attachments } = job.data;

    this.logger.log(`Sending email to ${email} using template ${template}`);

    // TODO: Integrate with SendGrid or email service
    // For now, just log
    await job.updateProgress(50);

    this.logger.log(`Email sent successfully to ${email}`);
    await job.updateProgress(100);
  }

  private async handleSendSms(job: Job<SendSmsJobData>): Promise<void> {
    const { phone, message } = job.data;

    this.logger.log(`Sending SMS to ${phone}`);

    // TODO: Integrate with Twilio
    await job.updateProgress(50);

    this.logger.log(`SMS sent successfully to ${phone}`);
    await job.updateProgress(100);
  }

  private async handleSendPush(job: Job<SendPushJobData>): Promise<void> {
    const { userId, title, body, data, badge } = job.data;

    this.logger.log(`Sending push notification to user ${userId}`);

    // TODO: Integrate with Firebase Cloud Messaging
    await job.updateProgress(50);

    this.logger.log(`Push notification sent successfully to user ${userId}`);
    await job.updateProgress(100);
  }

  private async handleSendBulkEmail(
    job: Job<SendBulkEmailJobData>,
  ): Promise<void> {
    const { recipients, template, commonData } = job.data;

    this.logger.log(
      `Sending bulk email to ${recipients.length} recipients using template ${template}`,
    );

    const batchSize = 50;
    const totalBatches = Math.ceil(recipients.length / batchSize);

    for (let i = 0; i < totalBatches; i++) {
      const batch = recipients.slice(i * batchSize, (i + 1) * batchSize);

      // TODO: Send batch via SendGrid
      this.logger.log(
        `Sent batch ${i + 1}/${totalBatches} (${batch.length} emails)`,
      );

      await job.updateProgress(((i + 1) / totalBatches) * 100);
    }

    this.logger.log(
      `Bulk email sent successfully to ${recipients.length} recipients`,
    );
  }
}
