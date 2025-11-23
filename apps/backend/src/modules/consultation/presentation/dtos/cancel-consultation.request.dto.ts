import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

/**
 * Cancel Consultation Request DTO
 */
export class CancelConsultationRequestDto {
  @ApiProperty({
    description: 'Cancellation reason',
    example: 'Не могу прийти в назначенное время',
    minLength: 1,
    maxLength: 500,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  cancellationReason: string;
}
