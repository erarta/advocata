import { BaseJobData } from '../interfaces/job-options.interface';

export interface ConsultationReminderJobData extends BaseJobData {
  consultationId: string;
  clientId: string;
  lawyerId: string;
  scheduledTime: Date;
}

export interface ConsultationStartNotificationJobData extends BaseJobData {
  consultationId: string;
  clientId: string;
  lawyerId: string;
}

export interface ConsultationEndProcessingJobData extends BaseJobData {
  consultationId: string;
  duration: number;
  endTime: Date;
}

export interface AutoCompleteConsultationJobData extends BaseJobData {
  consultationId: string;
}

export interface RequestReviewJobData extends BaseJobData {
  consultationId: string;
  clientId: string;
  lawyerId: string;
}

export const CONSULTATION_JOB_TYPES = {
  CONSULTATION_REMINDER: 'consultation-reminder',
  CONSULTATION_START_NOTIFICATION: 'consultation-start-notification',
  CONSULTATION_END_PROCESSING: 'consultation-end-processing',
  AUTO_COMPLETE_CONSULTATION: 'auto-complete-consultation',
  REQUEST_REVIEW: 'request-review',
} as const;

export type ConsultationJobType =
  (typeof CONSULTATION_JOB_TYPES)[keyof typeof CONSULTATION_JOB_TYPES];
