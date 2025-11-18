import { MessageType } from '../../../domain/value-objects/message-type.vo';

/**
 * Send Message Command
 *
 * Command to send a text message in a consultation.
 */
export class SendMessageCommand {
  constructor(
    public readonly consultationId: string,
    public readonly senderId: string,
    public readonly senderName: string,
    public readonly content: string,
    public readonly type: MessageType = MessageType.TEXT,
    public readonly senderAvatar?: string,
  ) {}
}
