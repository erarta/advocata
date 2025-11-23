import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { SendSmsCommand } from './send-sms.command';
import { Result } from '@/shared/domain/result';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

/**
 * Send SMS Command Handler
 *
 * Queues an SMS notification for sending
 */
@CommandHandler(SendSmsCommand)
export class SendSmsHandler implements ICommandHandler<SendSmsCommand> {
  private readonly logger = new Logger(SendSmsHandler.name);

  constructor(
    @InjectQueue('notifications')
    private readonly notificationQueue: Queue,
  ) {}

  async execute(command: SendSmsCommand): Promise<Result<string>> {
    try {
      const job = await this.notificationQueue.add('send-sms', {
        userId: command.userId,
        to: command.to,
        message: command.message,
        metadata: command.metadata,
      });

      this.logger.log(`SMS queued for sending`, {
        jobId: job.id,
        to: command.to,
      });

      return Result.ok<string>(job.id);
    } catch (error) {
      this.logger.error('Failed to queue SMS', {
        error: error.message,
        to: command.to,
      });

      return Result.fail<string>(`Failed to queue SMS: ${error.message}`);
    }
  }
}
