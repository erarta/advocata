import { BaseJobData } from '../interfaces/job-options.interface';

export interface UpdateLawyerStatsJobData extends BaseJobData {
  lawyerId: string;
  eventType: 'consultation_completed' | 'review_received' | 'payment_received';
}

export interface UpdatePlatformMetricsJobData extends BaseJobData {
  metricType: 'daily_revenue' | 'active_users' | 'consultations_count';
  value: number;
  date: Date;
}

export interface GenerateDailyReportJobData extends BaseJobData {
  date: Date;
}

export interface GenerateWeeklyReportJobData extends BaseJobData {
  weekStart: Date;
  weekEnd: Date;
}

export const ANALYTICS_JOB_TYPES = {
  UPDATE_LAWYER_STATS: 'update-lawyer-stats',
  UPDATE_PLATFORM_METRICS: 'update-platform-metrics',
  GENERATE_DAILY_REPORT: 'generate-daily-report',
  GENERATE_WEEKLY_REPORT: 'generate-weekly-report',
} as const;

export type AnalyticsJobType =
  (typeof ANALYTICS_JOB_TYPES)[keyof typeof ANALYTICS_JOB_TYPES];
