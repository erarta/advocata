import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { SendEmailCommand } from './send-email.command';
import { Result } from '@/shared/domain/result';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

/**
 * Send Email Command Handler
 *
 * Queues an email notification for sending
 */
@CommandHandler(SendEmailCommand)
export class SendEmailHandler implements ICommandHandler<SendEmailCommand> {
  private readonly logger = new Logger(SendEmailHandler.name);

  constructor(
    @InjectQueue('notifications')
    private readonly notificationQueue: Queue,
  ) {}

  async execute(command: SendEmailCommand): Promise<Result<string>> {
    try {
      const job = await this.notificationQueue.add('send-email', {
        userId: command.userId,
        to: command.to,
        subject: command.subject,
        body: command.body,
        html: command.html,
        templateId: command.templateId,
        templateData: command.templateData,
        metadata: command.metadata,
      });

      this.logger.log(`Email queued for sending`, {
        jobId: job.id,
        to: command.to,
        subject: command.subject,
      });

      return Result.ok<string>(job.id);
    } catch (error) {
      this.logger.error('Failed to queue email', {
        error: error.message,
        to: command.to,
      });

      return Result.fail<string>(`Failed to queue email: ${error.message}`);
    }
  }
}
