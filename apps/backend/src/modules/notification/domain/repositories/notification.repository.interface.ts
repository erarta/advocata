import { Notification } from '../entities/notification.entity';
import { NotificationType } from '../value-objects/notification-type.vo';
import { NotificationStatus } from '../value-objects/notification-status.vo';

/**
 * Notification Repository Interface
 */
export interface INotificationRepository {
  /**
   * Save notification
   */
  save(notification: Notification): Promise<Notification>;

  /**
   * Find notification by ID
   */
  findById(id: string): Promise<Notification | null>;

  /**
   * Find notifications by user ID
   */
  findByUserId(
    userId: string,
    limit?: number,
    offset?: number,
  ): Promise<Notification[]>;

  /**
   * Find notifications by status
   */
  findByStatus(
    status: NotificationStatus,
    limit?: number,
  ): Promise<Notification[]>;

  /**
   * Find failed notifications for retry
   */
  findFailedForRetry(limit?: number): Promise<Notification[]>;

  /**
   * Count user notifications
   */
  countByUserId(userId: string): Promise<number>;

  /**
   * Count notifications by type and status
   */
  countByTypeAndStatus(
    type: NotificationType,
    status: NotificationStatus,
    startDate?: Date,
    endDate?: Date,
  ): Promise<number>;

  /**
   * Delete old notifications
   */
  deleteOlderThan(date: Date): Promise<number>;
}

export const NOTIFICATION_REPOSITORY = Symbol('NOTIFICATION_REPOSITORY');
