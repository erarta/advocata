import { Message } from '../entities/message.entity';
import { MessageStatus } from '../value-objects/message-status.vo';

/**
 * Paginated result for messages
 */
export interface PaginatedMessages {
  items: Message[];
  total: number;
}

/**
 * Message Repository Interface
 *
 * Defines the contract for message persistence operations.
 * Implementation is in the infrastructure layer.
 */
export interface IMessageRepository {
  /**
   * Find message by ID
   */
  findById(id: string): Promise<Message | null>;

  /**
   * Find messages for a consultation
   *
   * @param consultationId - Consultation ID
   * @param includeDeleted - Whether to include soft-deleted messages
   * @param limit - Maximum number of messages to return
   * @param offset - Offset for pagination
   */
  findByConsultationId(
    consultationId: string,
    includeDeleted?: boolean,
    limit?: number,
    offset?: number,
  ): Promise<PaginatedMessages>;

  /**
   * Find messages sent by a user
   *
   * @param senderId - Sender user ID
   * @param limit - Maximum number of messages to return
   * @param offset - Offset for pagination
   */
  findBySenderId(
    senderId: string,
    limit?: number,
    offset?: number,
  ): Promise<PaginatedMessages>;

  /**
   * Count unread messages for a user in a consultation
   *
   * @param consultationId - Consultation ID
   * @param userId - User ID (the recipient, not sender)
   */
  countUnreadMessages(
    consultationId: string,
    userId: string,
  ): Promise<number>;

  /**
   * Count total unread messages for a user across all consultations
   *
   * @param userId - User ID
   */
  countTotalUnreadMessages(userId: string): Promise<number>;

  /**
   * Get last message for a consultation
   *
   * @param consultationId - Consultation ID
   * @param includeDeleted - Whether to include soft-deleted messages
   */
  findLastMessage(
    consultationId: string,
    includeDeleted?: boolean,
  ): Promise<Message | null>;

  /**
   * Get last message for each consultation where user is a participant
   *
   * @param userId - User ID
   */
  findLastMessagesForUser(userId: string): Promise<Map<string, Message>>;

  /**
   * Mark all messages in a consultation as read
   *
   * @param consultationId - Consultation ID
   * @param userId - User ID (the reader, not the sender)
   */
  markAllAsRead(consultationId: string, userId: string): Promise<number>;

  /**
   * Save a message
   */
  save(message: Message): Promise<void>;

  /**
   * Save multiple messages (bulk operation)
   */
  saveMany(messages: Message[]): Promise<void>;

  /**
   * Delete a message (hard delete)
   *
   * Note: Soft delete is handled via message.delete() method.
   * This method performs actual database deletion.
   */
  delete(id: string): Promise<void>;

  /**
   * Check if user is participant in consultation (for authorization)
   *
   * @param consultationId - Consultation ID
   * @param userId - User ID
   */
  isUserParticipant(consultationId: string, userId: string): Promise<boolean>;

  /**
   * Get recipient ID for a message
   *
   * Returns the other participant in the consultation (not the sender).
   *
   * @param consultationId - Consultation ID
   * @param senderId - Sender ID
   */
  getRecipientId(consultationId: string, senderId: string): Promise<string | null>;
}

/**
 * Repository token for dependency injection
 */
export const MESSAGE_REPOSITORY = Symbol('IMessageRepository');
