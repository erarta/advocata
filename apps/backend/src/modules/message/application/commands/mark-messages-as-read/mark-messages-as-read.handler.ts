import {
  Injectable,
  Inject,
  ForbiddenException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MarkMessagesAsReadCommand } from './mark-messages-as-read.command';
import {
  IMessageRepository,
  MESSAGE_REPOSITORY,
} from '../../../domain/repositories/message.repository.interface';

/**
 * Mark Messages As Read Command Handler
 *
 * Handles the command to mark all unread messages in a consultation as read.
 * This is typically called when user opens a chat conversation.
 */
@Injectable()
@CommandHandler(MarkMessagesAsReadCommand)
export class MarkMessagesAsReadHandler
  implements ICommandHandler<MarkMessagesAsReadCommand>
{
  constructor(
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: IMessageRepository,
  ) {}

  async execute(command: MarkMessagesAsReadCommand): Promise<any> {
    const { consultationId, userId } = command;

    // 1. Verify user is participant in consultation
    const isParticipant = await this.messageRepository.isUserParticipant(
      consultationId,
      userId,
    );

    if (!isParticipant) {
      throw new ForbiddenException(
        'Вы не участник этой консультации',
      );
    }

    // 2. Mark all messages as read
    const updatedCount = await this.messageRepository.markAllAsRead(
      consultationId,
      userId,
    );

    // 3. Return result
    return {
      consultationId,
      messagesMarkedAsRead: updatedCount,
    };
  }
}
