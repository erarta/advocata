import { BaseJobData } from '../interfaces/job-options.interface';

export interface SendEmailJobData extends BaseJobData {
  email: string;
  template: string;
  data: Record<string, any>;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
  }>;
}

export interface SendSmsJobData extends BaseJobData {
  phone: string;
  message: string;
}

export interface SendPushJobData extends BaseJobData {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
}

export interface SendBulkEmailJobData extends BaseJobData {
  recipients: Array<{
    email: string;
    data?: Record<string, any>;
  }>;
  template: string;
  commonData?: Record<string, any>;
}

export const NOTIFICATION_JOB_TYPES = {
  SEND_EMAIL: 'send-email',
  SEND_SMS: 'send-sms',
  SEND_PUSH: 'send-push',
  SEND_BULK_EMAIL: 'send-bulk-email',
} as const;

export type NotificationJobType =
  (typeof NOTIFICATION_JOB_TYPES)[keyof typeof NOTIFICATION_JOB_TYPES];
