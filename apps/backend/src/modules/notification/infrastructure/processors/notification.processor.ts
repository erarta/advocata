import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';
import {
  INotificationRepository,
  NOTIFICATION_REPOSITORY,
} from '../../domain/repositories/notification.repository.interface';
import {
  IEmailService,
  EMAIL_SERVICE,
} from '../../domain/services/email.service.interface';
import {
  ISmsService,
  SMS_SERVICE,
} from '../../domain/services/sms.service.interface';
import {
  IPushService,
  PUSH_SERVICE,
} from '../../domain/services/push.service.interface';
import { Notification } from '../../domain/entities/notification.entity';
import { NotificationType } from '../../domain/value-objects/notification-type.vo';
import { NotificationStatus } from '../../domain/value-objects/notification-status.vo';

/**
 * Notification Queue Processor
 *
 * Processes queued notification jobs asynchronously
 */
@Processor('notifications', {
  concurrency: 5, // Process 5 jobs in parallel
  limiter: {
    max: 100, // Max 100 jobs per duration
    duration: 60000, // 1 minute
  },
})
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: INotificationRepository,
    @Inject(EMAIL_SERVICE)
    private readonly emailService: IEmailService,
    @Inject(SMS_SERVICE)
    private readonly smsService: ISmsService,
    @Inject(PUSH_SERVICE)
    private readonly pushService: IPushService,
  ) {
    super();
  }

  /**
   * Process notification jobs
   */
  async process(job: Job): Promise<any> {
    this.logger.log(`Processing notification job`, {
      jobId: job.id,
      jobName: job.name,
    });

    try {
      switch (job.name) {
        case 'send-email':
          return await this.processSendEmail(job);
        case 'send-sms':
          return await this.processSendSms(job);
        case 'send-push':
          return await this.processSendPush(job);
        default:
          throw new Error(`Unknown job type: ${job.name}`);
      }
    } catch (error) {
      this.logger.error(`Failed to process notification job`, {
        jobId: job.id,
        jobName: job.name,
        error: error.message,
        stack: error.stack,
      });

      throw error; // Re-throw to trigger retry
    }
  }

  /**
   * Process send email job
   */
  private async processSendEmail(job: Job): Promise<void> {
    const {
      userId,
      to,
      subject,
      body,
      html,
      templateId,
      templateData,
      metadata,
    } = job.data;

    // Create notification entity
    const notificationResult = Notification.create(
      uuidv4(),
      userId,
      NotificationType.EMAIL,
      to,
      body,
      subject,
      templateId,
      templateData,
      metadata,
    );

    if (notificationResult.isFailure) {
      throw new Error(notificationResult.error);
    }

    const notification = notificationResult.getValue();

    try {
      // Save notification as pending
      await this.notificationRepository.save(notification);

      // Send email
      let sendResult;
      if (templateId) {
        sendResult = await this.emailService.sendTemplateEmail(to, templateId, templateData);
      } else {
        sendResult = await this.emailService.sendEmail(to, subject, body, html);
      }

      if (sendResult.isFailure) {
        throw new Error(sendResult.error);
      }

      // Mark as sent
      const externalId = sendResult.getValue();
      const markResult = notification.markAsSent(externalId);

      if (markResult.isFailure) {
        throw new Error(markResult.error);
      }

      // Save updated notification
      await this.notificationRepository.save(notification);

      this.logger.log(`Email notification sent successfully`, {
        notificationId: notification.id,
        to,
        externalId,
      });
    } catch (error) {
      // Mark as failed
      notification.markAsFailed(error.message);
      await this.notificationRepository.save(notification);

      throw error;
    }
  }

  /**
   * Process send SMS job
   */
  private async processSendSms(job: Job): Promise<void> {
    const { userId, to, message, metadata } = job.data;

    // Create notification entity
    const notificationResult = Notification.create(
      uuidv4(),
      userId,
      NotificationType.SMS,
      to,
      message,
      undefined,
      undefined,
      undefined,
      metadata,
    );

    if (notificationResult.isFailure) {
      throw new Error(notificationResult.error);
    }

    const notification = notificationResult.getValue();

    try {
      // Save notification as pending
      await this.notificationRepository.save(notification);

      // Send SMS
      const sendResult = await this.smsService.sendSms(to, message);

      if (sendResult.isFailure) {
        throw new Error(sendResult.error);
      }

      // Mark as sent
      const externalId = sendResult.getValue();
      const markResult = notification.markAsSent(externalId);

      if (markResult.isFailure) {
        throw new Error(markResult.error);
      }

      // Save updated notification
      await this.notificationRepository.save(notification);

      this.logger.log(`SMS notification sent successfully`, {
        notificationId: notification.id,
        to,
        externalId,
      });
    } catch (error) {
      // Mark as failed
      notification.markAsFailed(error.message);
      await this.notificationRepository.save(notification);

      throw error;
    }
  }

  /**
   * Process send push notification job
   */
  private async processSendPush(job: Job): Promise<void> {
    const { userId, deviceToken, title, body, data, metadata } = job.data;

    // Create notification entity
    const notificationResult = Notification.create(
      uuidv4(),
      userId,
      NotificationType.PUSH,
      deviceToken,
      body,
      title,
      undefined,
      undefined,
      { ...metadata, pushData: data },
    );

    if (notificationResult.isFailure) {
      throw new Error(notificationResult.error);
    }

    const notification = notificationResult.getValue();

    try {
      // Save notification as pending
      await this.notificationRepository.save(notification);

      // Send push notification
      const sendResult = await this.pushService.sendPush(deviceToken, title, body, data);

      if (sendResult.isFailure) {
        throw new Error(sendResult.error);
      }

      // Mark as sent
      const externalId = sendResult.getValue();
      const markResult = notification.markAsSent(externalId);

      if (markResult.isFailure) {
        throw new Error(markResult.error);
      }

      // Save updated notification
      await this.notificationRepository.save(notification);

      this.logger.log(`Push notification sent successfully`, {
        notificationId: notification.id,
        title,
        externalId,
      });
    } catch (error) {
      // Mark as failed
      notification.markAsFailed(error.message);
      await this.notificationRepository.save(notification);

      throw error;
    }
  }
}
