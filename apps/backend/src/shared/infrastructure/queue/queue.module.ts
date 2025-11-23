import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { QUEUE_NAMES } from './interfaces/job-options.interface';

// Processors
import { NotificationProcessor } from './processors/notification.processor';
import { PaymentProcessor } from './processors/payment.processor';
import { ConsultationProcessor } from './processors/consultation.processor';
import { EmailProcessor } from './processors/email.processor';
import { AnalyticsProcessor } from './processors/analytics.processor';

// Services
import { QueueService } from './services/queue.service';
import { QueueHealthService } from './services/queue-health.service';

// Controllers
import { QueueHealthController } from './controllers/queue-health.controller';

// Bull Board
import { BullBoardConfigModule } from './bull-board.module';

@Global()
@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.registerQueue(
      {
        name: QUEUE_NAMES.NOTIFICATIONS,
        defaultJobOptions: {
          removeOnComplete: {
            age: 24 * 3600, // 24 hours
            count: 1000,
          },
          removeOnFail: {
            age: 7 * 24 * 3600, // 7 days
          },
        },
      },
      {
        name: QUEUE_NAMES.PAYMENTS,
        defaultJobOptions: {
          removeOnComplete: {
            age: 30 * 24 * 3600, // 30 days (keep payment records longer)
            count: 5000,
          },
          removeOnFail: {
            age: 90 * 24 * 3600, // 90 days
          },
        },
      },
      {
        name: QUEUE_NAMES.CONSULTATIONS,
        defaultJobOptions: {
          removeOnComplete: {
            age: 24 * 3600,
            count: 1000,
          },
          removeOnFail: {
            age: 7 * 24 * 3600,
          },
        },
      },
      {
        name: QUEUE_NAMES.EMAILS,
        defaultJobOptions: {
          removeOnComplete: {
            age: 24 * 3600,
            count: 1000,
          },
          removeOnFail: {
            age: 7 * 24 * 3600,
          },
        },
      },
      {
        name: QUEUE_NAMES.ANALYTICS,
        defaultJobOptions: {
          removeOnComplete: {
            age: 7 * 24 * 3600, // Keep analytics jobs longer
            count: 500,
          },
          removeOnFail: {
            age: 30 * 24 * 3600,
          },
        },
      },
    ),
    BullBoardConfigModule,
  ],
  controllers: [QueueHealthController],
  providers: [
    // Processors
    NotificationProcessor,
    PaymentProcessor,
    ConsultationProcessor,
    EmailProcessor,
    AnalyticsProcessor,

    // Services
    QueueService,
    QueueHealthService,
  ],
  exports: [QueueService, QueueHealthService, BullModule],
})
export class QueueModule {}
