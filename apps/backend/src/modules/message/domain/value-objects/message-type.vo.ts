/**
 * Message Type Value Object
 *
 * Represents the type of message being sent.
 * Different types may require different handling and UI display.
 */
export enum MessageType {
  /**
   * Plain text message
   */
  TEXT = 'text',

  /**
   * Image attachment (jpg, png, gif, etc.)
   */
  IMAGE = 'image',

  /**
   * Document attachment (pdf, docx, etc.)
   */
  DOCUMENT = 'document',

  /**
   * Audio message or file
   */
  AUDIO = 'audio',

  /**
   * Video file
   */
  VIDEO = 'video',

  /**
   * System-generated message (consultation started/ended, etc.)
   */
  SYSTEM = 'system',
}

/**
 * Type guard to check if a string is a valid MessageType
 */
export function isValidMessageType(value: string): value is MessageType {
  return Object.values(MessageType).includes(value as MessageType);
}

/**
 * Get display name for message type (for UI)
 */
export function getMessageTypeDisplayName(type: MessageType): string {
  const displayNames: Record<MessageType, string> = {
    [MessageType.TEXT]: 'Текстовое сообщение',
    [MessageType.IMAGE]: 'Изображение',
    [MessageType.DOCUMENT]: 'Документ',
    [MessageType.AUDIO]: 'Аудио',
    [MessageType.VIDEO]: 'Видео',
    [MessageType.SYSTEM]: 'Системное сообщение',
  };

  return displayNames[type];
}

/**
 * Check if message type requires file attachment
 */
export function requiresAttachment(type: MessageType): boolean {
  return [
    MessageType.IMAGE,
    MessageType.DOCUMENT,
    MessageType.AUDIO,
    MessageType.VIDEO,
  ].includes(type);
}
