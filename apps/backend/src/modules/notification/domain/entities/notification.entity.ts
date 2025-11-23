import { AggregateRoot } from '@/shared/domain/aggregate-root';
import { Result } from '@/shared/domain/result';
import { NotificationType } from '../value-objects/notification-type.vo';
import { NotificationStatus } from '../value-objects/notification-status.vo';
import { NotificationSentEvent } from '../events/notification-sent.event';
import { NotificationDeliveredEvent } from '../events/notification-delivered.event';
import { NotificationFailedEvent } from '../events/notification-failed.event';

/**
 * Notification Entity Properties
 */
export interface NotificationProps {
  userId: string;
  type: NotificationType;
  status: NotificationStatus;
  recipient: string; // Email address, phone number, or device token
  subject?: string; // For emails
  body: string;
  templateId?: string;
  templateData?: Record<string, any>;
  metadata?: Record<string, any>;
  error?: string;
  externalId?: string; // ID from external service (SendGrid, Twilio, etc.)
  sentAt?: Date;
  deliveredAt?: Date;
  failedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Notification Entity (Aggregate Root)
 *
 * Represents a notification in the system.
 * Supports email, SMS, and push notifications.
 */
export class Notification extends AggregateRoot<NotificationProps> {
  // Maximum retry attempts for failed notifications
  private static readonly MAX_RETRY_ATTEMPTS = 3;

  get userId(): string {
    return this.props.userId;
  }

  get type(): NotificationType {
    return this.props.type;
  }

  get status(): NotificationStatus {
    return this.props.status;
  }

  get recipient(): string {
    return this.props.recipient;
  }

  get subject(): string | undefined {
    return this.props.subject;
  }

  get body(): string {
    return this.props.body;
  }

  get templateId(): string | undefined {
    return this.props.templateId;
  }

  get templateData(): Record<string, any> | undefined {
    return this.props.templateData;
  }

  get metadata(): Record<string, any> | undefined {
    return this.props.metadata;
  }

  get error(): string | undefined {
    return this.props.error;
  }

  get externalId(): string | undefined {
    return this.props.externalId;
  }

  get sentAt(): Date | undefined {
    return this.props.sentAt;
  }

  get deliveredAt(): Date | undefined {
    return this.props.deliveredAt;
  }

  get failedAt(): Date | undefined {
    return this.props.failedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /**
   * Create a new Notification
   */
  public static create(
    id: string,
    userId: string,
    type: NotificationType,
    recipient: string,
    body: string,
    subject?: string,
    templateId?: string,
    templateData?: Record<string, any>,
    metadata?: Record<string, any>,
  ): Result<Notification> {
    // Validate userId
    if (!userId || userId.trim().length === 0) {
      return Result.fail<Notification>('User ID is required');
    }

    // Validate recipient
    if (!recipient || recipient.trim().length === 0) {
      return Result.fail<Notification>('Recipient is required');
    }

    // Validate body
    if (!body || body.trim().length === 0) {
      return Result.fail<Notification>('Notification body is required');
    }

    // Validate subject for email notifications
    if (type.isEmail && (!subject || subject.trim().length === 0)) {
      return Result.fail<Notification>('Subject is required for email notifications');
    }

    const now = new Date();

    const notification = new Notification(
      {
        userId,
        type,
        status: NotificationStatus.PENDING,
        recipient,
        subject,
        body,
        templateId,
        templateData,
        metadata,
        createdAt: now,
        updatedAt: now,
      },
      id,
    );

    return Result.ok<Notification>(notification);
  }

  /**
   * Mark notification as sent
   */
  public markAsSent(externalId?: string): Result<void> {
    if (!this.status.isPending) {
      return Result.fail<void>('Only pending notifications can be marked as sent');
    }

    const now = new Date();

    this.props.status = NotificationStatus.SENT;
    this.props.externalId = externalId;
    this.props.sentAt = now;
    this.props.updatedAt = now;

    // Publish domain event
    this.addDomainEvent(
      new NotificationSentEvent({
        notificationId: this.id,
        userId: this.userId,
        type: this.type.value,
        recipient: this.recipient,
        sentAt: now,
        occurredAt: now,
      }),
    );

    return Result.ok<void>();
  }

  /**
   * Mark notification as delivered
   */
  public markAsDelivered(): Result<void> {
    if (!this.status.isSent && !this.status.isPending) {
      return Result.fail<void>('Only sent or pending notifications can be marked as delivered');
    }

    const now = new Date();

    this.props.status = NotificationStatus.DELIVERED;
    this.props.deliveredAt = now;
    this.props.updatedAt = now;

    // Publish domain event
    this.addDomainEvent(
      new NotificationDeliveredEvent({
        notificationId: this.id,
        userId: this.userId,
        type: this.type.value,
        recipient: this.recipient,
        deliveredAt: now,
        occurredAt: now,
      }),
    );

    return Result.ok<void>();
  }

  /**
   * Mark notification as failed
   */
  public markAsFailed(error: string): Result<void> {
    if (this.status.isDelivered) {
      return Result.fail<void>('Delivered notifications cannot be marked as failed');
    }

    const now = new Date();

    this.props.status = NotificationStatus.FAILED;
    this.props.error = error;
    this.props.failedAt = now;
    this.props.updatedAt = now;

    // Publish domain event
    this.addDomainEvent(
      new NotificationFailedEvent({
        notificationId: this.id,
        userId: this.userId,
        type: this.type.value,
        recipient: this.recipient,
        error,
        failedAt: now,
        occurredAt: now,
      }),
    );

    return Result.ok<void>();
  }

  /**
   * Mark notification as bounced
   */
  public markAsBounced(error: string): Result<void> {
    const now = new Date();

    this.props.status = NotificationStatus.BOUNCED;
    this.props.error = error;
    this.props.updatedAt = now;

    return Result.ok<void>();
  }

  /**
   * Get max retry attempts
   */
  public static getMaxRetryAttempts(): number {
    return Notification.MAX_RETRY_ATTEMPTS;
  }
}
