import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { GetUserNotificationsQuery } from './get-user-notifications.query';
import {
  INotificationRepository,
  NOTIFICATION_REPOSITORY,
} from '../../../domain/repositories/notification.repository.interface';
import { Notification } from '../../../domain/entities/notification.entity';

/**
 * Get User Notifications Query Handler
 */
@QueryHandler(GetUserNotificationsQuery)
export class GetUserNotificationsHandler
  implements IQueryHandler<GetUserNotificationsQuery>
{
  private readonly logger = new Logger(GetUserNotificationsHandler.name);

  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(query: GetUserNotificationsQuery): Promise<Notification[]> {
    return this.notificationRepository.findByUserId(
      query.userId,
      query.limit,
      query.offset,
    );
  }
}
