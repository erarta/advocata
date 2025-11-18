import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { SendMessageCommand } from './send-message.command';
import {
  IMessageRepository,
  MESSAGE_REPOSITORY,
} from '../../../domain/repositories/message.repository.interface';
import { Message } from '../../../domain/entities/message.entity';

/**
 * Send Message Command Handler
 *
 * Handles the command to send a message in a consultation.
 */
@Injectable()
@CommandHandler(SendMessageCommand)
export class SendMessageHandler
  implements ICommandHandler<SendMessageCommand>
{
  constructor(
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: IMessageRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: SendMessageCommand): Promise<any> {
    const {
      consultationId,
      senderId,
      senderName,
      content,
      type,
      senderAvatar,
    } = command;

    // 1. Verify user is participant in consultation
    const isParticipant = await this.messageRepository.isUserParticipant(
      consultationId,
      senderId,
    );

    if (!isParticipant) {
      throw new ForbiddenException(
        'Вы не участник этой консультации',
      );
    }

    // 2. Create message entity
    const messageId = uuidv4();

    const messageResult = Message.create(
      messageId,
      consultationId,
      senderId,
      senderName,
      content,
      type,
      senderAvatar,
    );

    if (messageResult.isFailure) {
      throw new Error(messageResult.error);
    }

    const message = messageResult.getValue();

    // 3. Save message to repository
    await this.messageRepository.save(message);

    // 4. Get recipient ID
    const recipientId = await this.messageRepository.getRecipientId(
      consultationId,
      senderId,
    );

    if (!recipientId) {
      throw new NotFoundException('Получатель не найден');
    }

    // 5. Publish MessageSentEvent
    message.publishSentEvent(recipientId);

    // 6. Publish all domain events
    message.domainEvents.forEach((event) => this.eventBus.publish(event));

    // 7. Return message details
    return {
      id: message.id,
      consultationId: message.consultationId,
      senderId: message.senderId,
      senderName: message.senderName,
      senderAvatar: message.senderAvatar,
      content: message.content,
      type: message.type,
      status: message.status,
      createdAt: message.createdAt,
      deliveredAt: message.deliveredAt,
      readAt: message.readAt,
    };
  }
}
