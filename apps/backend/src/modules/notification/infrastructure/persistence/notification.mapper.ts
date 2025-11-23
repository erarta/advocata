import { Notification } from '../../domain/entities/notification.entity';
import { NotificationType } from '../../domain/value-objects/notification-type.vo';
import { NotificationStatus } from '../../domain/value-objects/notification-status.vo';
import { NotificationOrmEntity } from './notification.orm-entity';

/**
 * Notification Mapper
 *
 * Maps between domain entities and ORM entities
 */
export class NotificationMapper {
  /**
   * Map domain entity to ORM entity
   */
  static toOrmEntity(notification: Notification): NotificationOrmEntity {
    const ormEntity = new NotificationOrmEntity();

    ormEntity.id = notification.id;
    ormEntity.userId = notification.userId;
    ormEntity.type = notification.type.value;
    ormEntity.status = notification.status.value;
    ormEntity.recipient = notification.recipient;
    ormEntity.subject = notification.subject;
    ormEntity.body = notification.body;
    ormEntity.templateId = notification.templateId;
    ormEntity.templateData = notification.templateData;
    ormEntity.metadata = notification.metadata;
    ormEntity.error = notification.error;
    ormEntity.externalId = notification.externalId;
    ormEntity.sentAt = notification.sentAt;
    ormEntity.deliveredAt = notification.deliveredAt;
    ormEntity.failedAt = notification.failedAt;
    ormEntity.createdAt = notification.createdAt;
    ormEntity.updatedAt = notification.updatedAt;

    return ormEntity;
  }

  /**
   * Map ORM entity to domain entity
   */
  static toDomain(ormEntity: NotificationOrmEntity): Notification {
    const typeResult = NotificationType.create(ormEntity.type);
    const statusResult = NotificationStatus.create(ormEntity.status);

    if (typeResult.isFailure || statusResult.isFailure) {
      throw new Error('Invalid notification data from database');
    }

    const notificationResult = Notification.create(
      ormEntity.id,
      ormEntity.userId,
      typeResult.getValue(),
      ormEntity.recipient,
      ormEntity.body,
      ormEntity.subject,
      ormEntity.templateId,
      ormEntity.templateData,
      ormEntity.metadata,
    );

    if (notificationResult.isFailure) {
      throw new Error(notificationResult.error);
    }

    const notification = notificationResult.getValue();

    // Set additional properties manually
    (notification as any).props.status = statusResult.getValue();
    (notification as any).props.error = ormEntity.error;
    (notification as any).props.externalId = ormEntity.externalId;
    (notification as any).props.sentAt = ormEntity.sentAt;
    (notification as any).props.deliveredAt = ormEntity.deliveredAt;
    (notification as any).props.failedAt = ormEntity.failedAt;
    (notification as any).props.createdAt = ormEntity.createdAt;
    (notification as any).props.updatedAt = ormEntity.updatedAt;

    return notification;
  }
}
