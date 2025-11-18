import { Injectable, Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUnreadCountQuery } from './get-unread-count.query';
import {
  IMessageRepository,
  MESSAGE_REPOSITORY,
} from '../../../domain/repositories/message.repository.interface';

/**
 * Get Unread Count Query Handler
 *
 * Handles the query to get count of unread messages.
 */
@Injectable()
@QueryHandler(GetUnreadCountQuery)
export class GetUnreadCountHandler
  implements IQueryHandler<GetUnreadCountQuery>
{
  constructor(
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: IMessageRepository,
  ) {}

  async execute(query: GetUnreadCountQuery): Promise<any> {
    const { userId, consultationId } = query;

    let count: number;

    if (consultationId) {
      // Get unread count for specific consultation
      count = await this.messageRepository.countUnreadMessages(
        consultationId,
        userId,
      );
    } else {
      // Get total unread count across all consultations
      count = await this.messageRepository.countTotalUnreadMessages(userId);
    }

    return {
      userId,
      consultationId,
      unreadCount: count,
    };
  }
}
