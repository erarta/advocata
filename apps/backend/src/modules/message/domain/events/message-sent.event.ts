import { DomainEvent } from '@/shared/domain/domain-event';
import { MessageType } from '../value-objects/message-type.vo';

/**
 * Message Sent Event Properties
 */
export interface MessageSentEventProps {
  messageId: string;
  consultationId: string;
  senderId: string;
  recipientId: string;
  type: MessageType;
  hasAttachment: boolean;
  occurredAt: Date;
}

/**
 * Message Sent Event
 *
 * Published when a new message is sent in a consultation.
 * Triggers notifications to the recipient.
 */
export class MessageSentEvent implements DomainEvent {
  public readonly _type = 'MessageSentEvent';
  public readonly occurredAt: Date;

  constructor(public readonly props: MessageSentEventProps) {
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

  get recipientId(): string {
    return this.props.recipientId;
  }

  get type(): MessageType {
    return this.props.type;
  }

  get hasAttachment(): boolean {
    return this.props.hasAttachment;
  }
}
