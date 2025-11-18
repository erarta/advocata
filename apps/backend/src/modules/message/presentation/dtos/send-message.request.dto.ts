import { IsString, IsUUID, IsEnum, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageType } from '../../domain/value-objects/message-type.vo';

/**
 * Send Message Request DTO
 *
 * Request body for sending a message in a consultation.
 */
export class SendMessageRequestDto {
  @ApiProperty({
    description: 'Consultation ID',
    example: 'a0000000-0000-0000-0000-000000000001',
  })
  @IsUUID()
  consultationId: string;

  @ApiProperty({
    description: 'Sender user ID',
    example: '11111111-1111-1111-1111-111111111111',
  })
  @IsUUID()
  senderId: string;

  @ApiProperty({
    description: 'Sender display name',
    example: 'Мария Иванова',
    minLength: 1,
    maxLength: 255,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  senderName: string;

  @ApiProperty({
    description: 'Message content',
    example: 'Добрый день! Нужна консультация по вопросу...',
    minLength: 1,
    maxLength: 10000,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  content: string;

  @ApiPropertyOptional({
    description: 'Message type',
    enum: MessageType,
    default: MessageType.TEXT,
    example: MessageType.TEXT,
  })
  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;

  @ApiPropertyOptional({
    description: 'Sender avatar URL',
    example: 'https://i.pravatar.cc/150?u=client1',
  })
  @IsOptional()
  @IsString()
  senderAvatar?: string;
}
