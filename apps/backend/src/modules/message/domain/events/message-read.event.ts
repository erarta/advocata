import { DomainEvent } from '@/shared/domain/domain-event';

/**
 * Message Read Event Properties
 */
export interface MessageReadEventProps {
  messageId: string;
  consultationId: string;
  senderId: string;
  readerId: string;
  readAt: Date;
  occurredAt: Date;
}

/**
 * Message Read Event
 *
 * Published when a message is marked as read.
 * Triggers read receipt notification to sender.
 */
export class MessageReadEvent implements DomainEvent {
  public readonly _type = 'MessageReadEvent';
  public readonly occurredAt: Date;

  constructor(public readonly props: MessageReadEventProps) {
    this.occurredAt = props.occurredAt;
  }

  get messageId(): string {
    return this.props.messageId;
  }

  get consultationId(): string {
    return this.props.consultationId;
  }

  get senderId(): string {
    return this.props.senderId;
  }

  get readerId(): string {
    return this.props.readerId;
  }

  get readAt(): Date {
    return this.props.readAt;
  }
}
