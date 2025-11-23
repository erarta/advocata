import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QueueService } from './queue.service';
import { QUEUE_NAMES } from '../interfaces/job-options.interface';

interface QueueHealth {
  queueName: string;
  isHealthy: boolean;
  status: 'healthy' | 'warning' | 'critical';
  message?: string;
  stats: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  };
  metrics: {
    backlogSize: number;
    failureRate: number;
    isBackedUp: boolean;
  };
}

@Injectable()
export class QueueHealthService {
  private readonly logger = new Logger(QueueHealthService.name);
  private readonly BACKLOG_THRESHOLD = 1000;
  private readonly FAILURE_RATE_THRESHOLD = 0.1; // 10%

  constructor(private readonly queueService: QueueService) {}

  async checkAllQueuesHealth(): Promise<QueueHealth[]> {
    const queueNames = Object.values(QUEUE_NAMES);
    const healthChecks = await Promise.all(
      queueNames.map((queueName) => this.checkQueueHealth(queueName)),
    );

    return healthChecks;
  }

  async checkQueueHealth(queueName: string): Promise<QueueHealth> {
    try {
      const stats = await this.queueService.getQueueStats(queueName);

      const backlogSize = stats.waiting + stats.delayed;
      const totalProcessed = stats.completed + stats.failed;
      const failureRate =
        totalProcessed > 0 ? stats.failed / totalProcessed : 0;
      const isBackedUp = backlogSize > this.BACKLOG_THRESHOLD;

      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      let message: string | undefined;

      if (isBackedUp) {
        status = 'warning';
        message = `Queue is backed up with ${backlogSize} pending jobs`;
      }

      if (failureRate > this.FAILURE_RATE_THRESHOLD) {
        status = 'critical';
        message = `High failure rate: ${(failureRate * 100).toFixed(2)}%`;
      }

      if (stats.failed > 100) {
        status = 'critical';
        message = `Too many failed jobs: ${stats.failed}`;
      }

      return {
        queueName,
        isHealthy: status === 'healthy',
        status,
        message,
        stats: {
          waiting: stats.waiting,
          active: stats.active,
          completed: stats.completed,
          failed: stats.failed,
          delayed: stats.delayed,
        },
        metrics: {
          backlogSize,
          failureRate,
          isBackedUp,
        },
      };
    } catch (error) {
      this.logger.error(
        `Error checking health for queue ${queueName}: ${error.message}`,
      );

      return {
        queueName,
        isHealthy: false,
        status: 'critical',
        message: `Error checking queue health: ${error.message}`,
        stats: {
          waiting: 0,
          active: 0,
          completed: 0,
          failed: 0,
          delayed: 0,
        },
        metrics: {
          backlogSize: 0,
          failureRate: 0,
          isBackedUp: false,
        },
      };
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async performHealthCheck() {
    this.logger.log('Performing scheduled queue health check...');

    const healthChecks = await this.checkAllQueuesHealth();

    for (const health of healthChecks) {
      if (health.status === 'critical') {
        this.logger.error(
          `CRITICAL: Queue ${health.queueName} - ${health.message}`,
        );
        // TODO: Send alert to admins
      } else if (health.status === 'warning') {
        this.logger.warn(
          `WARNING: Queue ${health.queueName} - ${health.message}`,
        );
      } else {
        this.logger.debug(`Queue ${health.queueName} is healthy`);
      }
    }
  }

  async getHealthReport() {
    const healthChecks = await this.checkAllQueuesHealth();
    const overallHealthy = healthChecks.every((check) => check.isHealthy);

    return {
      overall: overallHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date(),
      queues: healthChecks,
    };
  }
}
