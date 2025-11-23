import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QueueService } from '../services/queue.service';
import {
  ANALYTICS_JOB_TYPES,
  UpdateLawyerStatsJobData,
  GenerateDailyReportJobData,
  GenerateWeeklyReportJobData,
} from '../jobs/analytics.jobs';

/**
 * Example of integrating queue system with Analytics
 *
 * This shows how to:
 * 1. Update stats after events
 * 2. Schedule recurring reports
 */

@Injectable()
export class AnalyticsIntegrationExample {
  constructor(private readonly queueService: QueueService) {}

  /**
   * Update lawyer stats after consultation completion
   */
  async afterConsultationCompleted(lawyerId: string) {
    const jobData: UpdateLawyerStatsJobData = {
      lawyerId,
      eventType: 'consultation_completed',
      timestamp: new Date(),
    };

    await this.queueService.addAnalyticsJob(
      ANALYTICS_JOB_TYPES.UPDATE_LAWYER_STATS,
      jobData,
    );
  }

  /**
   * Schedule daily report generation at 2 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async scheduleDailyReport() {
    const jobData: GenerateDailyReportJobData = {
      date: new Date(),
      timestamp: new Date(),
    };

    await this.queueService.addAnalyticsJob(
      ANALYTICS_JOB_TYPES.GENERATE_DAILY_REPORT,
      jobData,
    );
  }

  /**
   * Schedule weekly report generation every Monday at 9 AM
   */
  @Cron(CronExpression.MONDAY_TO_FRIDAY_AT_9AM)
  async scheduleWeeklyReport() {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);

    const jobData: GenerateWeeklyReportJobData = {
      weekStart,
      weekEnd: now,
      timestamp: new Date(),
    };

    await this.queueService.addAnalyticsJob(
      ANALYTICS_JOB_TYPES.GENERATE_WEEKLY_REPORT,
      jobData,
    );
  }
}
