import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { GetConsultationMessagesQuery } from './get-consultation-messages.query';
import { ConsultationOrmEntity } from '../../../../../consultation/infrastructure/persistence/consultation.orm-entity';
import { MessageOrmEntity } from '../../../../../message/infrastructure/persistence/message.orm-entity';

interface MessageWithDetails {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: string;
  status: string;
  createdAt: Date;
  deliveredAt?: Date;
  readAt?: Date;
  attachments: any[];
}

interface PaginatedMessagesResponse {
  messages: MessageWithDetails[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@QueryHandler(GetConsultationMessagesQuery)
export class GetConsultationMessagesHandler
  implements IQueryHandler<GetConsultationMessagesQuery>
{
  constructor(
    @InjectRepository(ConsultationOrmEntity)
    private readonly consultationRepository: Repository<ConsultationOrmEntity>,
    @InjectRepository(MessageOrmEntity)
    private readonly messageRepository: Repository<MessageOrmEntity>,
  ) {}

  async execute(
    query: GetConsultationMessagesQuery,
  ): Promise<PaginatedMessagesResponse> {
    const { consultationId, dto } = query;
    const { page = 1, limit = 50 } = dto;

    // Verify consultation exists
    const consultation = await this.consultationRepository.findOne({
      where: { id: consultationId },
    });

    if (!consultation) {
      throw new NotFoundException(
        `Consultation with ID ${consultationId} not found`,
      );
    }

    // Build query for messages
    const queryBuilder =
      this.messageRepository.createQueryBuilder('message');

    queryBuilder
      .where('message.consultationId = :consultationId', { consultationId })
      .andWhere('message.deletedAt IS NULL')
      .orderBy('message.createdAt', 'ASC');

    // Count total
    const total = await queryBuilder.getCount();

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Execute query
    const messages = await queryBuilder.getMany();

    // Transform messages
    const transformedMessages: MessageWithDetails[] = messages.map((msg) => ({
      id: msg.id,
      senderId: msg.senderId,
      senderName: msg.senderName,
      senderAvatar: msg.senderAvatar,
      content: msg.content,
      type: msg.type,
      status: msg.status,
      createdAt: msg.createdAt,
      deliveredAt: msg.deliveredAt,
      readAt: msg.readAt,
      attachments: msg.attachments || [],
    }));

    return {
      messages: transformedMessages,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
