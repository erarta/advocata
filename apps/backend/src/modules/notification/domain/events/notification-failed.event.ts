import { DomainEvent } from '@/shared/domain/domain-event';

export interface NotificationFailedEventProps {
  notificationId: string;
  userId: string;
  type: string;
  recipient: string;
  error: string;
  failedAt: Date;
  occurredAt: Date;
}

/**
 * Notification Failed Event
 *
 * Raised when a notification fails to send.
 */
export class NotificationFailedEvent extends DomainEvent {
  public readonly notificationId: string;
  public readonly userId: string;
  public readonly type: string;
  public readonly recipient: string;
  public readonly error: string;
  public readonly failedAt: Date;

  constructor(props: NotificationFailedEventProps) {
    super(props.occurredAt);
    this.notificationId = props.notificationId;
    this.userId = props.userId;
    this.type = props.type;
    this.recipient = props.recipient;
    this.error = props.error;
    this.failedAt = props.failedAt;
  }
}
