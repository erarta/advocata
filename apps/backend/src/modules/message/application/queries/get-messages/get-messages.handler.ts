import {
  Injectable,
  Inject,
  ForbiddenException,
} from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMessagesQuery } from './get-messages.query';
import {
  IMessageRepository,
  MESSAGE_REPOSITORY,
} from '../../../domain/repositories/message.repository.interface';

/**
 * Get Messages Query Handler
 *
 * Handles the query to retrieve messages for a consultation.
 */
@Injectable()
@QueryHandler(GetMessagesQuery)
export class GetMessagesHandler implements IQueryHandler<GetMessagesQuery> {
  constructor(
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: IMessageRepository,
  ) {}

  async execute(query: GetMessagesQuery): Promise<any> {
    const {
      consultationId,
      userId,
      includeDeleted,
      limit,
      offset,
    } = query;

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

    // 2. Get messages
    const result = await this.messageRepository.findByConsultationId(
      consultationId,
      includeDeleted,
      limit,
      offset,
    );

    // 3. Map to response
    const items = result.items.map((message) => ({
      id: message.id,
      consultationId: message.consultationId,
      senderId: message.senderId,
      senderName: message.senderName,
      senderAvatar: message.senderAvatar,
      content: message.content,
      type: message.type,
      status: message.status,
      attachments: message.attachments.map((attachment) => ({
        id: attachment.id,
        fileName: attachment.fileName,
        fileUrl: attachment.fileUrl,
        fileSize: attachment.fileSize,
        fileSizeFormatted: attachment.fileSizeFormatted,
        mimeType: attachment.mimeType,
        createdAt: attachment.createdAt,
      })),
      createdAt: message.createdAt,
      deliveredAt: message.deliveredAt,
      readAt: message.readAt,
      deletedAt: message.deletedAt,
    }));

    return {
      items,
      total: result.total,
      limit,
      offset,
      hasMore: offset + items.length < result.total,
    };
  }
}
