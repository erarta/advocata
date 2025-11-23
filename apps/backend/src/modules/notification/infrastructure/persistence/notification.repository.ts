import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { INotificationRepository } from '../../domain/repositories/notification.repository.interface';
import { Notification } from '../../domain/entities/notification.entity';
import { NotificationType } from '../../domain/value-objects/notification-type.vo';
import { NotificationStatus } from '../../domain/value-objects/notification-status.vo';
import { NotificationOrmEntity } from './notification.orm-entity';
import { NotificationMapper } from './notification.mapper';

/**
 * Notification Repository Implementation
 *
 * Implements notification persistence using TypeORM
 */
@Injectable()
export class NotificationRepository implements INotificationRepository {
  private readonly logger = new Logger(NotificationRepository.name);

  constructor(
    @InjectRepository(NotificationOrmEntity)
    private readonly repository: Repository<NotificationOrmEntity>,
  ) {}

  /**
   * Save notification
   */
  async save(notification: Notification): Promise<Notification> {
    try {
      const ormEntity = NotificationMapper.toOrmEntity(notification);
      const savedEntity = await this.repository.save(ormEntity);
      return NotificationMapper.toDomain(savedEntity);
    } catch (error) {
      this.logger.error('Failed to save notification', {
        notificationId: notification.id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Find notification by ID
   */
  async findById(id: string): Promise<Notification | null> {
    const ormEntity = await this.repository.findOne({ where: { id } });

    if (!ormEntity) {
      return null;
    }

    return NotificationMapper.toDomain(ormEntity);
  }

  /**
   * Find notifications by user ID
   */
  async findByUserId(
    userId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<Notification[]> {
    const ormEntities = await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return ormEntities.map((entity) => NotificationMapper.toDomain(entity));
  }

  /**
   * Find notifications by status
   */
  async findByStatus(
    status: NotificationStatus,
    limit: number = 100,
  ): Promise<Notification[]> {
    const ormEntities = await this.repository.find({
      where: { status: status.value },
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return ormEntities.map((entity) => NotificationMapper.toDomain(entity));
  }

  /**
   * Find failed notifications for retry
   */
  async findFailedForRetry(limit: number = 50): Promise<Notification[]> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const ormEntities = await this.repository.find({
      where: {
        status: NotificationStatus.FAILED.value,
        failedAt: LessThan(fiveMinutesAgo),
      },
      order: { failedAt: 'ASC' },
      take: limit,
    });

    return ormEntities.map((entity) => NotificationMapper.toDomain(entity));
  }

  /**
   * Count user notifications
   */
  async countByUserId(userId: string): Promise<number> {
    return this.repository.count({ where: { userId } });
  }

  /**
   * Count notifications by type and status
   */
  async countByTypeAndStatus(
    type: NotificationType,
    status: NotificationStatus,
    startDate?: Date,
    endDate?: Date,
  ): Promise<number> {
    const where: any = {
      type: type.value,
      status: status.value,
    };

    if (startDate && endDate) {
      where.createdAt = MoreThan(startDate);
      where.createdAt = LessThan(endDate);
    }

    return this.repository.count({ where });
  }

  /**
   * Delete old notifications
   */
  async deleteOlderThan(date: Date): Promise<number> {
    const result = await this.repository.delete({
      createdAt: LessThan(date),
    });

    return result.affected || 0;
  }
}
