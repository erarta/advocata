import { DomainEvent } from '@/shared/domain/domain-event';

export interface NotificationSentEventProps {
  notificationId: string;
  userId: string;
  type: string;
  recipient: string;
  sentAt: Date;
  occurredAt: Date;
}

/**
 * Notification Sent Event
 *
 * Raised when a notification is successfully sent.
 */
export class NotificationSentEvent extends DomainEvent {
  public readonly notificationId: string;
  public readonly userId: string;
  public readonly type: string;
  public readonly recipient: string;
  public readonly sentAt: Date;

  constructor(props: NotificationSentEventProps) {
    super(props.occurredAt);
    this.notificationId = props.notificationId;
    this.userId = props.userId;
    this.type = props.type;
    this.recipient = props.recipient;
    this.sentAt = props.sentAt;
  }
}
