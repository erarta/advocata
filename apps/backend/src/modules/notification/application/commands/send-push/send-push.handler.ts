import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { SendPushCommand } from './send-push.command';
import { Result } from '@/shared/domain/result';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

/**
 * Send Push Notification Command Handler
 *
 * Queues a push notification for sending
 */
@CommandHandler(SendPushCommand)
export class SendPushHandler implements ICommandHandler<SendPushCommand> {
  private readonly logger = new Logger(SendPushHandler.name);

  constructor(
    @InjectQueue('notifications')
    private readonly notificationQueue: Queue,
  ) {}

  async execute(command: SendPushCommand): Promise<Result<string>> {
    try {
      const job = await this.notificationQueue.add('send-push', {
        userId: command.userId,
        deviceToken: command.deviceToken,
        title: command.title,
        body: command.body,
        data: command.data,
        metadata: command.metadata,
      });

      this.logger.log(`Push notification queued for sending`, {
        jobId: job.id,
        title: command.title,
      });

      return Result.ok<string>(job.id);
    } catch (error) {
      this.logger.error('Failed to queue push notification', {
        error: error.message,
        title: command.title,
      });

      return Result.fail<string>(`Failed to queue push notification: ${error.message}`);
    }
  }
}
