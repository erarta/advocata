import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageType } from '../../domain/value-objects/message-type.vo';
import { MessageStatus } from '../../domain/value-objects/message-status.vo';

/**
 * Message Attachment Response DTO
 */
export class MessageAttachmentResponseDto {
  @ApiProperty({ description: 'Attachment ID' })
  id: string;

  @ApiProperty({ description: 'Original file name', example: 'contract.pdf' })
  fileName: string;

  @ApiProperty({
    description: 'File URL in storage',
    example: 'consultations/abc123/user456/20250118_143022_a3b4c5d6.pdf',
  })
  fileUrl: string;

  @ApiProperty({ description: 'File size in bytes', example: 245678 })
  fileSize: number;

  @ApiProperty({
    description: 'Human-readable file size',
    example: '240 KB',
  })
  fileSizeFormatted: string;

  @ApiProperty({ description: 'MIME type', example: 'application/pdf' })
  mimeType: string;

  @ApiProperty({ description: 'Upload timestamp' })
  createdAt: Date;
}

/**
 * Message Response DTO
 *
 * Response format for message data.
 */
export class MessageResponseDto {
  @ApiProperty({
    description: 'Message ID',
    example: 'msg-0001-0000-0000-0000-000000000001',
  })
  id: string;

  @ApiProperty({
    description: 'Consultation ID',
    example: 'a0000000-0000-0000-0000-000000000001',
  })
  consultationId: string;

  @ApiProperty({
    description: 'Sender user ID',
    example: '11111111-1111-1111-1111-111111111111',
  })
  senderId: string;

  @ApiProperty({
    description: 'Sender display name',
    example: 'Мария Иванова',
  })
  senderName: string;

  @ApiPropertyOptional({
    description: 'Sender avatar URL',
    example: 'https://i.pravatar.cc/150?u=client1',
  })
  senderAvatar?: string;

  @ApiProperty({
    description: 'Message content',
    example: 'Добрый день! Нужна консультация...',
  })
  content: string;

  @ApiProperty({
    description: 'Message type',
    enum: MessageType,
    example: MessageType.TEXT,
  })
  type: MessageType;

  @ApiProperty({
    description: 'Message status',
    enum: MessageStatus,
    example: MessageStatus.SENT,
  })
  status: MessageStatus;

  @ApiProperty({
    description: 'Message attachments',
    type: [MessageAttachmentResponseDto],
    example: [],
  })
  attachments: MessageAttachmentResponseDto[];

  @ApiProperty({
    description: 'Message creation timestamp',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Message delivery timestamp',
  })
  deliveredAt?: Date;

  @ApiPropertyOptional({
    description: 'Message read timestamp',
  })
  readAt?: Date;

  @ApiPropertyOptional({
    description: 'Message deletion timestamp (soft delete)',
  })
  deletedAt?: Date;
}

/**
 * Paginated Messages Response DTO
 */
export class PaginatedMessagesResponseDto {
  @ApiProperty({
    description: 'Array of messages',
    type: [MessageResponseDto],
  })
  items: MessageResponseDto[];

  @ApiProperty({
    description: 'Total count of messages',
    example: 42,
  })
  total: number;

  @ApiProperty({
    description: 'Limit (page size)',
    example: 50,
  })
  limit: number;

  @ApiProperty({
    description: 'Offset (starting position)',
    example: 0,
  })
  offset: number;

  @ApiProperty({
    description: 'Whether there are more messages',
    example: false,
  })
  hasMore: boolean;
}
