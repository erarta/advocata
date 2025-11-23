import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  IsDateString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ConsultationType } from '../../domain/enums';

/**
 * Book Consultation Request DTO
 */
export class BookConsultationRequestDto {
  @ApiProperty({
    description: 'Client ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  clientId: string;

  @ApiProperty({
    description: 'Lawyer ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  lawyerId: string;

  @ApiProperty({
    description: 'Consultation type',
    enum: ConsultationType,
    example: ConsultationType.Scheduled,
  })
  @IsEnum(ConsultationType)
  type: ConsultationType;

  @ApiProperty({
    description: 'Consultation description',
    example: 'Нужна помощь по ДТП',
    minLength: 10,
    maxLength: 2000,
  })
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description: string;

  @ApiPropertyOptional({
    description: 'Scheduled start time (ISO 8601)',
    example: '2025-01-20T14:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  scheduledStart?: string;

  @ApiPropertyOptional({
    description: 'Scheduled end time (ISO 8601)',
    example: '2025-01-20T15:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  scheduledEnd?: string;
}
