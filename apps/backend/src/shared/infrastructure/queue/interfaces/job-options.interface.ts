import { JobsOptions } from 'bullmq';

export enum JobPriority {
  CRITICAL = 1, // OTP, emergency notifications
  HIGH = 2, // Payment confirmations, consultation reminders
  NORMAL = 3, // Welcome emails, newsletters
  LOW = 4, // Analytics, reports
}

export interface BaseJobData {
  timestamp?: Date;
  userId?: string;
  metadata?: Record<string, any>;
}

export const DEFAULT_JOB_OPTIONS: JobsOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000, // 2 seconds, then 4, then 8
  },
  removeOnComplete: {
    age: 24 * 3600, // Keep completed jobs for 24 hours
    count: 1000, // Keep max 1000 completed jobs
  },
  removeOnFail: {
    age: 7 * 24 * 3600, // Keep failed jobs for 7 days
  },
};

export const CRITICAL_JOB_OPTIONS: JobsOptions = {
  ...DEFAULT_JOB_OPTIONS,
  priority: JobPriority.CRITICAL,
  attempts: 5,
  backoff: {
    type: 'exponential',
    delay: 1000,
  },
};

export const HIGH_PRIORITY_JOB_OPTIONS: JobsOptions = {
  ...DEFAULT_JOB_OPTIONS,
  priority: JobPriority.HIGH,
  attempts: 4,
};

export const LOW_PRIORITY_JOB_OPTIONS: JobsOptions = {
  ...DEFAULT_JOB_OPTIONS,
  priority: JobPriority.LOW,
  attempts: 2,
};

export const QUEUE_NAMES = {
  NOTIFICATIONS: 'notifications',
  PAYMENTS: 'payments',
  CONSULTATIONS: 'consultations',
  EMAILS: 'emails',
  ANALYTICS: 'analytics',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
