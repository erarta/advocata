import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  QUEUE_NAMES,
  DEFAULT_JOB_OPTIONS,
  CRITICAL_JOB_OPTIONS,
  HIGH_PRIORITY_JOB_OPTIONS,
  LOW_PRIORITY_JOB_OPTIONS,
} from '../interfaces/job-options.interface';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.NOTIFICATIONS) private notificationQueue: Queue,
    @InjectQueue(QUEUE_NAMES.PAYMENTS) private paymentQueue: Queue,
    @InjectQueue(QUEUE_NAMES.CONSULTATIONS) private consultationQueue: Queue,
    @InjectQueue(QUEUE_NAMES.EMAILS) private emailQueue: Queue,
    @InjectQueue(QUEUE_NAMES.ANALYTICS) private analyticsQueue: Queue,
  ) {}

  // Notification Queue Methods
  async addNotificationJob(
    jobName: string,
    data: any,
    options = DEFAULT_JOB_OPTIONS,
  ) {
    this.logger.log(`Adding notification job: ${jobName}`);
    return await this.notificationQueue.add(jobName, data, options);
  }

  // Payment Queue Methods
  async addPaymentJob(jobName: string, data: any, options = DEFAULT_JOB_OPTIONS) {
    this.logger.log(`Adding payment job: ${jobName}`);
    return await this.paymentQueue.add(jobName, data, options);
  }

  async addPaymentJobWithHighPriority(jobName: string, data: any) {
    return await this.addPaymentJob(jobName, data, HIGH_PRIORITY_JOB_OPTIONS);
  }

  // Consultation Queue Methods
  async addConsultationJob(
    jobName: string,
    data: any,
    options = DEFAULT_JOB_OPTIONS,
  ) {
    this.logger.log(`Adding consultation job: ${jobName}`);
    return await this.consultationQueue.add(jobName, data, options);
  }

  async scheduleConsultationJob(
    jobName: string,
    data: any,
    delay: number, // milliseconds
  ) {
    this.logger.log(`Scheduling consultation job: ${jobName} with delay ${delay}ms`);
    return await this.consultationQueue.add(jobName, data, {
      ...DEFAULT_JOB_OPTIONS,
      delay,
    });
  }

  // Email Queue Methods
  async addEmailJob(jobName: string, data: any, options = DEFAULT_JOB_OPTIONS) {
    this.logger.log(`Adding email job: ${jobName}`);
    return await this.emailQueue.add(jobName, data, options);
  }

  async addCriticalEmailJob(jobName: string, data: any) {
    return await this.addEmailJob(jobName, data, CRITICAL_JOB_OPTIONS);
  }

  // Analytics Queue Methods
  async addAnalyticsJob(
    jobName: string,
    data: any,
    options = LOW_PRIORITY_JOB_OPTIONS,
  ) {
    this.logger.log(`Adding analytics job: ${jobName}`);
    return await this.analyticsQueue.add(jobName, data, options);
  }

  async scheduleRecurringJob(
    queueName: string,
    jobName: string,
    data: any,
    cronExpression: string,
  ) {
    this.logger.log(
      `Scheduling recurring job: ${jobName} on ${queueName} with cron: ${cronExpression}`,
    );

    const queue = this.getQueueByName(queueName);
    return await queue.add(jobName, data, {
      repeat: {
        pattern: cronExpression,
      },
    });
  }

  // Job Management
  async removeJob(queueName: string, jobId: string) {
    const queue = this.getQueueByName(queueName);
    const job = await queue.getJob(jobId);
    if (job) {
      await job.remove();
      this.logger.log(`Removed job ${jobId} from ${queueName}`);
    }
  }

  async retryFailedJob(queueName: string, jobId: string) {
    const queue = this.getQueueByName(queueName);
    const job = await queue.getJob(jobId);
    if (job) {
      await job.retry();
      this.logger.log(`Retried job ${jobId} in ${queueName}`);
    }
  }

  // Queue Stats
  async getQueueStats(queueName: string) {
    const queue = this.getQueueByName(queueName);
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    return {
      queueName,
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    };
  }

  async getAllQueueStats() {
    const queueNames = Object.values(QUEUE_NAMES);
    return await Promise.all(
      queueNames.map((queueName) => this.getQueueStats(queueName)),
    );
  }

  // Helper Methods
  private getQueueByName(queueName: string): Queue {
    switch (queueName) {
      case QUEUE_NAMES.NOTIFICATIONS:
        return this.notificationQueue;
      case QUEUE_NAMES.PAYMENTS:
        return this.paymentQueue;
      case QUEUE_NAMES.CONSULTATIONS:
        return this.consultationQueue;
      case QUEUE_NAMES.EMAILS:
        return this.emailQueue;
      case QUEUE_NAMES.ANALYTICS:
        return this.analyticsQueue;
      default:
        throw new Error(`Unknown queue: ${queueName}`);
    }
  }

  async cleanQueue(queueName: string, grace: number = 0) {
    const queue = this.getQueueByName(queueName);
    await queue.clean(grace, 100, 'completed');
    await queue.clean(grace, 100, 'failed');
    this.logger.log(`Cleaned queue ${queueName}`);
  }

  async pauseQueue(queueName: string) {
    const queue = this.getQueueByName(queueName);
    await queue.pause();
    this.logger.log(`Paused queue ${queueName}`);
  }

  async resumeQueue(queueName: string) {
    const queue = this.getQueueByName(queueName);
    await queue.resume();
    this.logger.log(`Resumed queue ${queueName}`);
  }

  async onModuleDestroy() {
    this.logger.log('Closing all queues...');
    await Promise.all([
      this.notificationQueue.close(),
      this.paymentQueue.close(),
      this.consultationQueue.close(),
      this.emailQueue.close(),
      this.analyticsQueue.close(),
    ]);
  }
}
