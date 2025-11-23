import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { GetNotificationQuery } from './get-notification.query';
import {
  INotificationRepository,
  NOTIFICATION_REPOSITORY,
} from '../../../domain/repositories/notification.repository.interface';
import { Notification } from '../../../domain/entities/notification.entity';

/**
 * Get Notification Query Handler
 */
@QueryHandler(GetNotificationQuery)
export class GetNotificationHandler implements IQueryHandler<GetNotificationQuery> {
  private readonly logger = new Logger(GetNotificationHandler.name);

  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(query: GetNotificationQuery): Promise<Notification> {
    const notification = await this.notificationRepository.findById(query.notificationId);

    if (!notification) {
      throw new NotFoundException(`Notification ${query.notificationId} not found`);
    }

    return notification;
  }
}
