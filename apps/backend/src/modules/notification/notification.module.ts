import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';

// Infrastructure
import { NotificationOrmEntity } from './infrastructure/persistence/notification.orm-entity';
import { NotificationRepository } from './infrastructure/persistence/notification.repository';
import { NOTIFICATION_REPOSITORY } from './domain/repositories/notification.repository.interface';
import { SendGridService } from './infrastructure/services/sendgrid.service';
import { EMAIL_SERVICE } from './domain/services/email.service.interface';
import { TwilioService } from './infrastructure/services/twilio.service';
import { SMS_SERVICE } from './domain/services/sms.service.interface';
import { FirebasePushService } from './infrastructure/services/firebase-push.service';
import { PUSH_SERVICE } from './domain/services/push.service.interface';
import { NotificationProcessor } from './infrastructure/processors/notification.processor';

// Application - Commands
import { SendEmailHandler } from './application/commands/send-email/send-email.handler';
import { SendSmsHandler } from './application/commands/send-sms/send-sms.handler';
import { SendPushHandler } from './application/commands/send-push/send-push.handler';

// Application - Queries
import { GetNotificationHandler } from './application/queries/get-notification/get-notification.handler';
import { GetUserNotificationsHandler } from './application/queries/get-user-notifications/get-user-notifications.handler';

// Application - Services
import { NotificationService } from './application/services/notification.service';

// Presentation
import { NotificationController } from './presentation/controllers/notification.controller';

const commandHandlers = [SendEmailHandler, SendSmsHandler, SendPushHandler];

const queryHandlers = [GetNotificationHandler, GetUserNotificationsHandler];

const repositories = [
  {
    provide: NOTIFICATION_REPOSITORY,
    useClass: NotificationRepository,
  },
];

const services = [
  {
    provide: EMAIL_SERVICE,
    useClass: SendGridService,
  },
  {
    provide: SMS_SERVICE,
    useClass: TwilioService,
  },
  {
    provide: PUSH_SERVICE,
    useClass: FirebasePushService,
  },
  NotificationService,
];

/**
 * Notification Module
 *
 * Bounded context for Notification functionality.
 * Handles email, SMS, and push notifications with asynchronous processing.
 *
 * Architecture:
 * - Domain Layer: Notification entity, NotificationType/Status value objects, events, repository interface
 * - Application Layer: Commands (SendEmail, SendSms, SendPush), Queries (Get, GetUserNotifications)
 * - Infrastructure Layer: SendGrid, Twilio, Firebase services, TypeORM repository, BullMQ processor
 * - Presentation Layer: REST API controller, DTOs
 *
 * Features:
 * - Email notifications via SendGrid (with template support)
 * - SMS notifications via Twilio
 * - Push notifications via Firebase Cloud Messaging
 * - Asynchronous processing with BullMQ
 * - Automatic retry logic (3 attempts, exponential backoff)
 * - Notification status tracking and history
 * - Delivery confirmation and error handling
 *
 * Integration:
 * - Integrates with Identity Module for OTP sending
 * - Used by Consultation Module for booking confirmations
 * - Used by Payment Module for payment receipts
 */
@Module({
  imports: [
    CqrsModule,
    ConfigModule,
    TypeOrmModule.forFeature([NotificationOrmEntity]),
    BullModule.registerQueue({
      name: 'notifications',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000, // 2 seconds initial delay
        },
        removeOnComplete: {
          age: 86400, // Keep completed jobs for 24 hours
          count: 1000, // Keep last 1000 completed jobs
        },
        removeOnFail: {
          age: 604800, // Keep failed jobs for 7 days
        },
      },
    }),
  ],
  controllers: [NotificationController],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    ...repositories,
    ...services,
    NotificationProcessor,
  ],
  exports: [...repositories, ...services, NotificationService],
})
export class NotificationModule {}
