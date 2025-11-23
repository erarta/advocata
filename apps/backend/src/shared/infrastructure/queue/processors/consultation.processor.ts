import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import {
  CONSULTATION_JOB_TYPES,
  ConsultationReminderJobData,
  ConsultationStartNotificationJobData,
  ConsultationEndProcessingJobData,
  AutoCompleteConsultationJobData,
  RequestReviewJobData,
} from '../jobs/consultation.jobs';
import { QUEUE_NAMES } from '../interfaces/job-options.interface';

@Processor(QUEUE_NAMES.CONSULTATIONS, {
  concurrency: 10,
})
@Injectable()
export class ConsultationProcessor extends WorkerHost {
  private readonly logger = new Logger(ConsultationProcessor.name);

  async process(job: Job): Promise<any> {
    this.logger.log(
      `Processing consultation job ${job.id} of type ${job.name} (attempt ${job.attemptsMade + 1}/${job.opts.attempts})`,
    );

    try {
      switch (job.name) {
        case CONSULTATION_JOB_TYPES.CONSULTATION_REMINDER:
          return await this.handleConsultationReminder(
            job as Job<ConsultationReminderJobData>,
          );

        case CONSULTATION_JOB_TYPES.CONSULTATION_START_NOTIFICATION:
          return await this.handleConsultationStartNotification(
            job as Job<ConsultationStartNotificationJobData>,
          );

        case CONSULTATION_JOB_TYPES.CONSULTATION_END_PROCESSING:
          return await this.handleConsultationEndProcessing(
            job as Job<ConsultationEndProcessingJobData>,
          );

        case CONSULTATION_JOB_TYPES.AUTO_COMPLETE_CONSULTATION:
          return await this.handleAutoCompleteConsultation(
            job as Job<AutoCompleteConsultationJobData>,
          );

        case CONSULTATION_JOB_TYPES.REQUEST_REVIEW:
          return await this.handleRequestReview(job as Job<RequestReviewJobData>);

        default:
          this.logger.warn(`Unknown consultation job type: ${job.name}`);
          throw new Error(`Unknown consultation job type: ${job.name}`);
      }
    } catch (error) {
      this.logger.error(
        `Error processing consultation job ${job.id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async handleConsultationReminder(
    job: Job<ConsultationReminderJobData>,
  ): Promise<void> {
    const { consultationId, clientId, lawyerId, scheduledTime } = job.data;

    this.logger.log(
      `Sending consultation reminder for ${consultationId}. Scheduled: ${scheduledTime.toISOString()}`,
    );

    // TODO: Send notifications to both client and lawyer
    await job.updateProgress(50);

    this.logger.log(`Consultation reminder sent for ${consultationId}`);
    await job.updateProgress(100);
  }

  private async handleConsultationStartNotification(
    job: Job<ConsultationStartNotificationJobData>,
  ): Promise<void> {
    const { consultationId, clientId, lawyerId } = job.data;

    this.logger.log(
      `Sending consultation start notification for ${consultationId}`,
    );

    // TODO: Notify both parties that consultation is starting
    await job.updateProgress(50);

    this.logger.log(
      `Consultation start notification sent for ${consultationId}`,
    );
    await job.updateProgress(100);
  }

  private async handleConsultationEndProcessing(
    job: Job<ConsultationEndProcessingJobData>,
  ): Promise<void> {
    const { consultationId, duration, endTime } = job.data;

    this.logger.log(
      `Processing consultation end for ${consultationId}. Duration: ${duration} minutes`,
    );

    // TODO: Update consultation status, calculate fees, etc.
    await job.updateProgress(50);

    this.logger.log(`Consultation ${consultationId} end processing completed`);
    await job.updateProgress(100);
  }

  private async handleAutoCompleteConsultation(
    job: Job<AutoCompleteConsultationJobData>,
  ): Promise<void> {
    const { consultationId } = job.data;

    this.logger.log(
      `Auto-completing consultation ${consultationId} (24h timeout)`,
    );

    // TODO: Mark consultation as completed if not already
    await job.updateProgress(50);

    this.logger.log(`Consultation ${consultationId} auto-completed`);
    await job.updateProgress(100);
  }

  private async handleRequestReview(
    job: Job<RequestReviewJobData>,
  ): Promise<void> {
    const { consultationId, clientId, lawyerId } = job.data;

    this.logger.log(
      `Requesting review from client ${clientId} for consultation ${consultationId}`,
    );

    // TODO: Send notification to client requesting review
    await job.updateProgress(50);

    this.logger.log(`Review request sent for consultation ${consultationId}`);
    await job.updateProgress(100);
  }
}
