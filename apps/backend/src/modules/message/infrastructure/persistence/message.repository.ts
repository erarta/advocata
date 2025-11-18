import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import {
  IMessageRepository,
  PaginatedMessages,
} from '../../domain/repositories/message.repository.interface';
import { Message } from '../../domain/entities/message.entity';
import { MessageOrmEntity } from './message.orm-entity';
import { MessageMapper } from './message.mapper';

/**
 * Message Repository Implementation
 *
 * TypeORM implementation of IMessageRepository.
 * Handles persistence operations for messages.
 */
@Injectable()
export class MessageRepository implements IMessageRepository {
  constructor(
    @InjectRepository(MessageOrmEntity)
    private readonly repository: Repository<MessageOrmEntity>,
  ) {}

  /**
   * Find message by ID
   */
  async findById(id: string): Promise<Message | null> {
    const ormEntity = await this.repository.findOne({
      where: { id },
      relations: ['attachments'],
    });

    return ormEntity ? MessageMapper.toDomain(ormEntity) : null;
  }

  /**
   * Find messages for a consultation
   */
  async findByConsultationId(
    consultationId: string,
    includeDeleted: boolean = false,
    limit: number = 50,
    offset: number = 0,
  ): Promise<PaginatedMessages> {
    const query = this.repository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.attachments', 'attachments')
      .where('message.consultationId = :consultationId', { consultationId });

    if (!includeDeleted) {
      query.andWhere('message.deletedAt IS NULL');
    }

    query.orderBy('message.createdAt', 'ASC');
    query.limit(limit).offset(offset);

    const [ormEntities, total] = await query.getManyAndCount();

    return {
      items: MessageMapper.toDomainMany(ormEntities),
      total,
    };
  }

  /**
   * Find messages sent by a user
   */
  async findBySenderId(
    senderId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<PaginatedMessages> {
    const query = this.repository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.attachments', 'attachments')
      .where('message.senderId = :senderId', { senderId })
      .andWhere('message.deletedAt IS NULL');

    query.orderBy('message.createdAt', 'DESC');
    query.limit(limit).offset(offset);

    const [ormEntities, total] = await query.getManyAndCount();

    return {
      items: MessageMapper.toDomainMany(ormEntities),
      total,
    };
  }

  /**
   * Count unread messages for a user in a consultation
   */
  async countUnreadMessages(
    consultationId: string,
    userId: string,
  ): Promise<number> {
    return await this.repository
      .createQueryBuilder('message')
      .where('message.consultationId = :consultationId', { consultationId })
      .andWhere('message.senderId != :userId', { userId })
      .andWhere('message.readAt IS NULL')
      .andWhere('message.deletedAt IS NULL')
      .getCount();
  }

  /**
   * Count total unread messages for a user across all consultations
   */
  async countTotalUnreadMessages(userId: string): Promise<number> {
    // Need to check consultations table to ensure user is a participant
    // For now, we'll count all messages where user is not the sender
    return await this.repository
      .createQueryBuilder('message')
      .innerJoin('consultations', 'consultation', 'consultation.id = message.consultationId')
      .where('(consultation.clientId = :userId OR consultation.lawyerId = :userId)', { userId })
      .andWhere('message.senderId != :userId', { userId })
      .andWhere('message.readAt IS NULL')
      .andWhere('message.deletedAt IS NULL')
      .getCount();
  }

  /**
   * Get last message for a consultation
   */
  async findLastMessage(
    consultationId: string,
    includeDeleted: boolean = false,
  ): Promise<Message | null> {
    const query = this.repository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.attachments', 'attachments')
      .where('message.consultationId = :consultationId', { consultationId });

    if (!includeDeleted) {
      query.andWhere('message.deletedAt IS NULL');
    }

    query.orderBy('message.createdAt', 'DESC');
    query.limit(1);

    const ormEntity = await query.getOne();

    return ormEntity ? MessageMapper.toDomain(ormEntity) : null;
  }

  /**
   * Get last message for each consultation where user is a participant
   */
  async findLastMessagesForUser(userId: string): Promise<Map<string, Message>> {
    // This query gets the latest message for each consultation
    const ormEntities = await this.repository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.attachments', 'attachments')
      .innerJoin('consultations', 'consultation', 'consultation.id = message.consultationId')
      .where('(consultation.clientId = :userId OR consultation.lawyerId = :userId)', { userId })
      .andWhere('message.deletedAt IS NULL')
      .distinctOn(['message.consultationId'])
      .orderBy('message.consultationId')
      .addOrderBy('message.createdAt', 'DESC')
      .getMany();

    const messagesMap = new Map<string, Message>();

    for (const ormEntity of ormEntities) {
      const message = MessageMapper.toDomain(ormEntity);
      messagesMap.set(message.consultationId, message);
    }

    return messagesMap;
  }

  /**
   * Mark all messages in a consultation as read
   */
  async markAllAsRead(consultationId: string, userId: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder()
      .update(MessageOrmEntity)
      .set({
        readAt: new Date(),
        status: 'read',
      })
      .where('consultationId = :consultationId', { consultationId })
      .andWhere('senderId != :userId', { userId })
      .andWhere('readAt IS NULL')
      .andWhere('deletedAt IS NULL')
      .execute();

    return result.affected || 0;
  }

  /**
   * Save a message
   */
  async save(message: Message): Promise<void> {
    const ormEntity = MessageMapper.toOrm(message);
    await this.repository.save(ormEntity);
  }

  /**
   * Save multiple messages (bulk operation)
   */
  async saveMany(messages: Message[]): Promise<void> {
    const ormEntities = MessageMapper.toOrmMany(messages);
    await this.repository.save(ormEntities);
  }

  /**
   * Delete a message (hard delete)
   */
  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  /**
   * Check if user is participant in consultation
   */
  async isUserParticipant(
    consultationId: string,
    userId: string,
  ): Promise<boolean> {
    const count = await this.repository
      .createQueryBuilder('message')
      .innerJoin('consultations', 'consultation', 'consultation.id = :consultationId', {
        consultationId,
      })
      .where('(consultation.clientId = :userId OR consultation.lawyerId = :userId)', {
        userId,
      })
      .getCount();

    return count > 0;
  }

  /**
   * Get recipient ID for a message
   */
  async getRecipientId(
    consultationId: string,
    senderId: string,
  ): Promise<string | null> {
    const result = await this.repository.query(
      `
      SELECT
        CASE
          WHEN "clientId" = $1 THEN "lawyerId"
          ELSE "clientId"
        END AS recipient_id
      FROM consultations
      WHERE id = $2
      `,
      [senderId, consultationId],
    );

    return result.length > 0 ? result[0].recipient_id : null;
  }
}
