/**
 * Message Status Value Object
 *
 * Represents the delivery and read status of a message.
 * Status transitions: sending → sent → delivered → read
 */
export enum MessageStatus {
  /**
   * Message is being sent (client-side only, usually)
   */
  SENDING = 'sending',

  /**
   * Message has been sent to server
   */
  SENT = 'sent',

  /**
   * Message has been delivered to recipient's device
   */
  DELIVERED = 'delivered',

  /**
   * Message has been read by recipient
   */
  READ = 'read',

  /**
   * Message failed to send
   */
  FAILED = 'failed',
}

/**
 * Type guard to check if a string is a valid MessageStatus
 */
export function isValidMessageStatus(value: string): value is MessageStatus {
  return Object.values(MessageStatus).includes(value as MessageStatus);
}

/**
 * Get display name for message status (for UI)
 */
export function getMessageStatusDisplayName(status: MessageStatus): string {
  const displayNames: Record<MessageStatus, string> = {
    [MessageStatus.SENDING]: 'Отправка...',
    [MessageStatus.SENT]: 'Отправлено',
    [MessageStatus.DELIVERED]: 'Доставлено',
    [MessageStatus.READ]: 'Прочитано',
    [MessageStatus.FAILED]: 'Ошибка отправки',
  };

  return displayNames[status];
}

/**
 * Check if status transition is valid
 */
export function isValidStatusTransition(
  from: MessageStatus,
  to: MessageStatus,
): boolean {
  const validTransitions: Record<MessageStatus, MessageStatus[]> = {
    [MessageStatus.SENDING]: [MessageStatus.SENT, MessageStatus.FAILED],
    [MessageStatus.SENT]: [MessageStatus.DELIVERED, MessageStatus.FAILED],
    [MessageStatus.DELIVERED]: [MessageStatus.READ],
    [MessageStatus.READ]: [], // Terminal state
    [MessageStatus.FAILED]: [MessageStatus.SENDING], // Can retry
  };

  return validTransitions[from]?.includes(to) ?? false;
}

/**
 * Get icon name for message status (for UI)
 */
export function getMessageStatusIcon(status: MessageStatus): string {
  const icons: Record<MessageStatus, string> = {
    [MessageStatus.SENDING]: 'clock',
    [MessageStatus.SENT]: 'check',
    [MessageStatus.DELIVERED]: 'check-double',
    [MessageStatus.READ]: 'check-double-blue',
    [MessageStatus.FAILED]: 'exclamation-circle',
  };

  return icons[status];
}
