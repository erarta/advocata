import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Mark Messages As Read Request DTO
 *
 * Request body for marking messages as read.
 */
export class MarkMessagesAsReadRequestDto {
  @ApiProperty({
    description: 'Consultation ID',
    example: 'a0000000-0000-0000-0000-000000000001',
  })
  @IsUUID()
  consultationId: string;

  @ApiProperty({
    description: 'User ID (reader)',
    example: '11111111-1111-1111-1111-111111111111',
  })
  @IsUUID()
  userId: string;
}
