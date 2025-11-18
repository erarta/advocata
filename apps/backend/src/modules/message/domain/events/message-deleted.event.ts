import { DomainEvent } from '@/shared/domain/domain-event';

/**
 * Message Deleted Event Properties
 */
export interface MessageDeletedEventProps {
  messageId: string;
  consultationId: string;
  senderId: string;
  deletedAt: Date;
  occurredAt: Date;
}

/**
 * Message Deleted Event
 *
 * Published when a message is soft-deleted by its sender.
 * Triggers UI updates to hide the message.
 */
export class MessageDeletedEvent implements DomainEvent {
  public readonly _type = 'MessageDeletedEvent';
  public readonly occurredAt: Date;

  constructor(public readonly props: MessageDeletedEventProps) {
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

  get deletedAt(): Date {
    return this.props.deletedAt;
  }
}
