import {
  Injectable,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { DeleteMessageCommand } from './delete-message.command';
import {
  IMessageRepository,
  MESSAGE_REPOSITORY,
} from '../../../domain/repositories/message.repository.interface';

/**
 * Delete Message Command Handler
 *
 * Handles the command to soft-delete a message.
 * Only the sender can delete their own message.
 */
@Injectable()
@CommandHandler(DeleteMessageCommand)
export class DeleteMessageHandler
  implements ICommandHandler<DeleteMessageCommand>
{
  constructor(
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: IMessageRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: DeleteMessageCommand): Promise<any> {
    const { messageId, userId } = command;

    // 1. Find message
    const message = await this.messageRepository.findById(messageId);

    if (!message) {
      throw new NotFoundException('Сообщение не найдено');
    }

    // 2. Delete message (domain logic will check if user is sender)
    const deleteResult = message.delete(userId);

    if (deleteResult.isFailure) {
      throw new Error(deleteResult.error);
    }

    // 3. Save updated message
    await this.messageRepository.save(message);

    // 4. Publish domain events
    message.domainEvents.forEach((event) => this.eventBus.publish(event));

    // 5. Return result
    return {
      id: message.id,
      deletedAt: message.deletedAt,
    };
  }
}
