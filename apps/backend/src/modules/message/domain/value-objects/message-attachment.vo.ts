import { ValueObject } from '@/shared/domain/value-object';
import { Result } from '@/shared/domain/result';

/**
 * Message Attachment Value Object Properties
 */
export interface MessageAttachmentProps {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  createdAt: Date;
}

/**
 * Message Attachment Value Object
 *
 * Represents a file attached to a message.
 * Immutable value object containing file metadata.
 */
export class MessageAttachment extends ValueObject<MessageAttachmentProps> {
  // Maximum file size: 50 MB
  private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024;

  // Allowed MIME types
  private static readonly ALLOWED_MIME_TYPES = [
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',

    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',

    // Archives
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',

    // Audio
    'audio/mpeg',
    'audio/mp4',
    'audio/ogg',
    'audio/wav',
    'audio/webm',

    // Video
    'video/mp4',
    'video/mpeg',
    'video/ogg',
    'video/webm',
    'video/quicktime',
  ];

  get id(): string {
    return this.props.id;
  }

  get fileName(): string {
    return this.props.fileName;
  }

  get fileUrl(): string {
    return this.props.fileUrl;
  }

  get fileSize(): number {
    return this.props.fileSize;
  }

  get mimeType(): string {
    return this.props.mimeType;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  /**
   * Get file size in human-readable format
   */
  get fileSizeFormatted(): string {
    const bytes = this.props.fileSize;

    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Get file extension
   */
  get fileExtension(): string {
    return this.props.fileName.split('.').pop()?.toLowerCase() || '';
  }

  /**
   * Check if attachment is an image
   */
  get isImage(): boolean {
    return this.props.mimeType.startsWith('image/');
  }

  /**
   * Check if attachment is a document
   */
  get isDocument(): boolean {
    return (
      this.props.mimeType.startsWith('application/') ||
      this.props.mimeType.startsWith('text/')
    );
  }

  /**
   * Check if attachment is audio
   */
  get isAudio(): boolean {
    return this.props.mimeType.startsWith('audio/');
  }

  /**
   * Check if attachment is video
   */
  get isVideo(): boolean {
    return this.props.mimeType.startsWith('video/');
  }

  /**
   * Create a new MessageAttachment
   */
  public static create(
    props: MessageAttachmentProps,
  ): Result<MessageAttachment> {
    // Validate fileName
    if (!props.fileName || props.fileName.trim().length === 0) {
      return Result.fail<MessageAttachment>('File name is required');
    }

    if (props.fileName.length > 500) {
      return Result.fail<MessageAttachment>(
        'File name is too long (max 500 characters)',
      );
    }

    // Validate fileUrl
    if (!props.fileUrl || props.fileUrl.trim().length === 0) {
      return Result.fail<MessageAttachment>('File URL is required');
    }

    // Validate fileSize
    if (props.fileSize <= 0) {
      return Result.fail<MessageAttachment>('File size must be positive');
    }

    if (props.fileSize > this.MAX_FILE_SIZE) {
      return Result.fail<MessageAttachment>(
        `File size exceeds maximum allowed (${this.MAX_FILE_SIZE / 1024 / 1024} MB)`,
      );
    }

    // Validate mimeType
    if (!props.mimeType || props.mimeType.trim().length === 0) {
      return Result.fail<MessageAttachment>('MIME type is required');
    }

    if (!this.ALLOWED_MIME_TYPES.includes(props.mimeType)) {
      return Result.fail<MessageAttachment>(
        `MIME type "${props.mimeType}" is not allowed`,
      );
    }

    // Validate createdAt
    if (!(props.createdAt instanceof Date) || isNaN(props.createdAt.getTime())) {
      return Result.fail<MessageAttachment>('Invalid created date');
    }

    return Result.ok<MessageAttachment>(new MessageAttachment(props));
  }

  /**
   * Check if MIME type is allowed
   */
  public static isAllowedMimeType(mimeType: string): boolean {
    return this.ALLOWED_MIME_TYPES.includes(mimeType);
  }

  /**
   * Check if file size is within limits
   */
  public static isValidFileSize(size: number): boolean {
    return size > 0 && size <= this.MAX_FILE_SIZE;
  }

  /**
   * Get max file size in bytes
   */
  public static getMaxFileSize(): number {
    return this.MAX_FILE_SIZE;
  }

  /**
   * Get allowed MIME types
   */
  public static getAllowedMimeTypes(): string[] {
    return [...this.ALLOWED_MIME_TYPES];
  }
}
