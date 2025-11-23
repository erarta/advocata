import { DomainEvent } from '@/shared/domain/domain-event';

export interface NotificationDeliveredEventProps {
  notificationId: string;
  userId: string;
  type: string;
  recipient: string;
  deliveredAt: Date;
  occurredAt: Date;
}

/**
 * Notification Delivered Event
 *
 * Raised when a notification is confirmed as delivered.
 */
export class NotificationDeliveredEvent extends DomainEvent {
  public readonly notificationId: string;
  public readonly userId: string;
  public readonly type: string;
  public readonly recipient: string;
  public readonly deliveredAt: Date;

  constructor(props: NotificationDeliveredEventProps) {
    super(props.occurredAt);
    this.notificationId = props.notificationId;
    this.userId = props.userId;
    this.type = props.type;
    this.recipient = props.recipient;
    this.deliveredAt = props.deliveredAt;
  }
}
