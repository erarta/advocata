import { Injectable } from '@nestjs/common';
import { QueueService } from '../services/queue.service';
import {
  CONSULTATION_JOB_TYPES,
  ConsultationReminderJobData,
  RequestReviewJobData,
  AutoCompleteConsultationJobData,
} from '../jobs/consultation.jobs';

/**
 * Example of integrating queue system with Consultation Module
 *
 * Usage in ConsultationService:
 *
 * 1. Inject QueueService in your consultation service constructor
 * 2. Use the methods shown below after consultation operations
 */

@Injectable()
export class ConsultationIntegrationExample {
  constructor(private readonly queueService: QueueService) {}

  /**
   * After booking a consultation, schedule reminder
   */
  async afterConsultationBooked(
    consultationId: string,
    clientId: string,
    lawyerId: string,
    scheduledTime: Date,
  ) {
    const reminderJobData: ConsultationReminderJobData = {
      consultationId,
      clientId,
      lawyerId,
      scheduledTime,
      timestamp: new Date(),
    };

    // Schedule reminder 1 hour before consultation
    const delay = scheduledTime.getTime() - Date.now() - 3600000; // 1 hour before

    if (delay > 0) {
      await this.queueService.scheduleConsultationJob(
        CONSULTATION_JOB_TYPES.CONSULTATION_REMINDER,
        reminderJobData,
        delay,
      );
    }

    // Schedule auto-complete job 24 hours after consultation
    const autoCompleteJobData: AutoCompleteConsultationJobData = {
      consultationId,
      timestamp: new Date(),
    };

    const autoCompleteDelay =
      scheduledTime.getTime() - Date.now() + 24 * 3600000; // 24 hours after

    await this.queueService.scheduleConsultationJob(
      CONSULTATION_JOB_TYPES.AUTO_COMPLETE_CONSULTATION,
      autoCompleteJobData,
      autoCompleteDelay,
    );
  }

  /**
   * After consultation completion, request review
   */
  async afterConsultationCompleted(
    consultationId: string,
    clientId: string,
    lawyerId: string,
  ) {
    const reviewJobData: RequestReviewJobData = {
      consultationId,
      clientId,
      lawyerId,
      timestamp: new Date(),
    };

    // Delay: 1 hour after completion
    await this.queueService.scheduleConsultationJob(
      CONSULTATION_JOB_TYPES.REQUEST_REVIEW,
      reviewJobData,
      3600000, // 1 hour
    );
  }
}
