import { AggregateRoot } from '@/shared/domain/aggregate-root';
import { Result } from '@/shared/domain/result';
import { MessageType } from '../value-objects/message-type.vo';
import { MessageStatus } from '../value-objects/message-status.vo';
import { MessageAttachment } from '../value-objects/message-attachment.vo';
import { MessageSentEvent } from '../events/message-sent.event';
import { MessageReadEvent } from '../events/message-read.event';
import { MessageDeletedEvent } from '../events/message-deleted.event';

/**
 * Message Entity Properties
 */
export interface MessageProps {
  consultationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: MessageType;
  status: MessageStatus;
  attachments: MessageAttachment[];
  createdAt: Date;
  deliveredAt?: Date;
  readAt?: Date;
  deletedAt?: Date;
}

/**
 * Message Entity (Aggregate Root)
 *
 * Represents a message sent in a consultation chat.
 * Contains business logic for message lifecycle (send, deliver, read, delete).
 */
export class Message extends AggregateRoot<MessageProps> {
  // Content constraints
  private static readonly MIN_CONTENT_LENGTH = 1;
  private static readonly MAX_CONTENT_LENGTH = 10000;
  private static readonly MAX_SENDER_NAME_LENGTH = 255;

  get consultationId(): string {
    return this.props.consultationId;
  }

  get senderId(): string {
    return this.props.senderId;
  }

  get senderName(): string {
    return this.props.senderName;
  }

  get senderAvatar(): string | undefined {
    return this.props.senderAvatar;
  }

  get content(): string {
    return this.props.content;
  }

  get type(): MessageType {
    return this.props.type;
  }

  get status(): MessageStatus {
    return this.props.status;
  }

  get attachments(): MessageAttachment[] {
    return [...this.props.attachments];
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get deliveredAt(): Date | undefined {
    return this.props.deliveredAt;
  }

  get readAt(): Date | undefined {
    return this.props.readAt;
  }

  get deletedAt(): Date | undefined {
    return this.props.deletedAt;
  }

  /**
   * Check if message is deleted
   */
  get isDeleted(): boolean {
    return this.props.deletedAt !== undefined;
  }

  /**
   * Check if message is read
   */
  get isRead(): boolean {
    return this.props.readAt !== undefined;
  }

  /**
   * Check if message is delivered
   */
  get isDelivered(): boolean {
    return this.props.deliveredAt !== undefined;
  }

  /**
   * Check if message has attachments
   */
  get hasAttachments(): boolean {
    return this.props.attachments.length > 0;
  }

  /**
   * Create a new Message
   */
  public static create(
    id: string,
    consultationId: string,
    senderId: string,
    senderName: string,
    content: string,
    type: MessageType = MessageType.TEXT,
    senderAvatar?: string,
  ): Result<Message> {
    // Validate consultationId
    if (!consultationId || consultationId.trim().length === 0) {
      return Result.fail<Message>('Consultation ID is required');
    }

    // Validate senderId
    if (!senderId || senderId.trim().length === 0) {
      return Result.fail<Message>('Sender ID is required');
    }

    // Validate senderName
    if (!senderName || senderName.trim().length === 0) {
      return Result.fail<Message>('Sender name is required');
    }

    if (senderName.length > this.MAX_SENDER_NAME_LENGTH) {
      return Result.fail<Message>(
        `Sender name is too long (max ${this.MAX_SENDER_NAME_LENGTH} characters)`,
      );
    }

    // Validate content
    const contentTrimmed = content.trim();

    if (contentTrimmed.length < this.MIN_CONTENT_LENGTH) {
      return Result.fail<Message>('Message content cannot be empty');
    }

    if (contentTrimmed.length > this.MAX_CONTENT_LENGTH) {
      return Result.fail<Message>(
        `Message content is too long (max ${this.MAX_CONTENT_LENGTH} characters)`,
      );
    }

    // Create message
    const message = new Message(
      {
        consultationId,
        senderId,
        senderName,
        senderAvatar,
        content: contentTrimmed,
        type,
        status: MessageStatus.SENT,
        attachments: [],
        createdAt: new Date(),
      },
      id,
    );

    return Result.ok<Message>(message);
  }

  /**
   * Create a system message
   */
  public static createSystemMessage(
    id: string,
    consultationId: string,
    content: string,
  ): Result<Message> {
    return this.create(
      id,
      consultationId,
      'system',
      'Система',
      content,
      MessageType.SYSTEM,
    );
  }

  /**
   * Add attachment to message
   */
  public addAttachment(attachment: MessageAttachment): Result<void> {
    if (this.isDeleted) {
      return Result.fail<void>('Cannot add attachment to deleted message');
    }

    // Check if attachment already exists
    const exists = this.props.attachments.some(
      (a) => a.id === attachment.id,
    );

    if (exists) {
      return Result.fail<void>('Attachment already exists');
    }

    this.props.attachments.push(attachment);

    return Result.ok<void>();
  }

  /**
   * Mark message as delivered
   */
  public markAsDelivered(): Result<void> {
    if (this.isDeleted) {
      return Result.fail<void>('Cannot deliver deleted message');
    }

    if (this.isDelivered) {
      return Result.fail<void>('Message already delivered');
    }

    if (this.props.status === MessageStatus.SENDING) {
      return Result.fail<void>('Cannot deliver message that is still sending');
    }

    this.props.deliveredAt = new Date();
    this.props.status = MessageStatus.DELIVERED;

    return Result.ok<void>();
  }

  /**
   * Mark message as read
   *
   * @param readerId - ID of the user who read the message
   */
  public markAsRead(readerId: string): Result<void> {
    if (this.isDeleted) {
      return Result.fail<void>('Cannot mark deleted message as read');
    }

    if (this.isRead) {
      return Result.fail<void>('Message already read');
    }

    // Cannot mark own message as read
    if (this.senderId === readerId) {
      return Result.fail<void>('Cannot mark own message as read');
    }

    const now = new Date();

    // Auto-mark as delivered if not already
    if (!this.isDelivered) {
      this.props.deliveredAt = now;
    }

    this.props.readAt = now;
    this.props.status = MessageStatus.READ;

    // Publish domain event
    this.addDomainEvent(
      new MessageReadEvent({
        messageId: this.id,
        consultationId: this.consultationId,
        senderId: this.senderId,
        readerId,
        readAt: now,
        occurredAt: now,
      }),
    );

    return Result.ok<void>();
  }

  /**
   * Soft delete message
   *
   * Only the sender can delete their own message.
   *
   * @param userId - ID of the user attempting to delete
   */
  public delete(userId: string): Result<void> {
    if (this.isDeleted) {
      return Result.fail<void>('Message already deleted');
    }

    // Only sender can delete message
    if (this.senderId !== userId) {
      return Result.fail<void>('Only sender can delete message');
    }

    // System messages cannot be deleted
    if (this.type === MessageType.SYSTEM) {
      return Result.fail<void>('System messages cannot be deleted');
    }

    const now = new Date();
    this.props.deletedAt = now;

    // Publish domain event
    this.addDomainEvent(
      new MessageDeletedEvent({
        messageId: this.id,
        consultationId: this.consultationId,
        senderId: this.senderId,
        deletedAt: now,
        occurredAt: now,
      }),
    );

    return Result.ok<void>();
  }

  /**
   * Publish MessageSentEvent
   *
   * Call this after successfully saving the message to the database.
   *
   * @param recipientId - ID of the recipient (other participant in consultation)
   */
  public publishSentEvent(recipientId: string): void {
    this.addDomainEvent(
      new MessageSentEvent({
        messageId: this.id,
        consultationId: this.consultationId,
        senderId: this.senderId,
        recipientId,
        type: this.type,
        hasAttachment: this.hasAttachments,
        occurredAt: this.createdAt,
      }),
    );
  }

  /**
   * Validate message content length
   */
  public static isValidContentLength(content: string): boolean {
    const length = content.trim().length;
    return (
      length >= this.MIN_CONTENT_LENGTH && length <= this.MAX_CONTENT_LENGTH
    );
  }

  /**
   * Get max content length
   */
  public static getMaxContentLength(): number {
    return this.MAX_CONTENT_LENGTH;
  }

  /**
   * Get min content length
   */
  public static getMinContentLength(): number {
    return this.MIN_CONTENT_LENGTH;
  }
}
