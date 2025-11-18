import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConsultationType, ConsultationStatus } from '../../domain/enums';

/**
 * Consultation Response DTO
 */
export class ConsultationResponseDto {
  @ApiProperty({
    description: 'Consultation ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Client ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  clientId: string;

  @ApiProperty({
    description: 'Lawyer ID',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  lawyerId: string;

  @ApiProperty({
    description: 'Consultation type',
    enum: ConsultationType,
    example: ConsultationType.Scheduled,
  })
  type: ConsultationType;

  @ApiProperty({
    description: 'Consultation status',
    enum: ConsultationStatus,
    example: ConsultationStatus.Pending,
  })
  status: ConsultationStatus;

  @ApiProperty({
    description: 'Description',
    example: 'Нужна помощь по ДТП',
  })
  description: string;

  @ApiProperty({
    description: 'Price in rubles',
    example: 3000,
  })
  price: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'RUB',
  })
  currency: string;

  @ApiPropertyOptional({
    description: 'Scheduled start time',
    example: '2025-01-20T14:00:00Z',
  })
  scheduledStart?: Date;

  @ApiPropertyOptional({
    description: 'Scheduled end time',
    example: '2025-01-20T15:00:00Z',
  })
  scheduledEnd?: Date;

  @ApiPropertyOptional({
    description: 'Confirmed at',
    example: '2025-01-20T13:00:00Z',
  })
  confirmedAt?: Date;

  @ApiPropertyOptional({
    description: 'Started at',
    example: '2025-01-20T14:00:00Z',
  })
  startedAt?: Date;

  @ApiPropertyOptional({
    description: 'Completed at',
    example: '2025-01-20T15:00:00Z',
  })
  completedAt?: Date;

  @ApiPropertyOptional({
    description: 'Cancelled at',
    example: '2025-01-20T13:30:00Z',
  })
  cancelledAt?: Date;

  @ApiPropertyOptional({
    description: 'Rating (1-5)',
    example: 5,
  })
  rating?: number;

  @ApiPropertyOptional({
    description: 'Review text',
    example: 'Отличная консультация',
  })
  review?: string;

  @ApiPropertyOptional({
    description: 'Cancellation reason',
    example: 'Не могу прийти',
  })
  cancellationReason?: string;

  @ApiPropertyOptional({
    description: 'Actual duration in minutes',
    example: 60,
  })
  actualDuration?: number;

  @ApiProperty({
    description: 'Created at',
    example: '2025-01-20T12:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Updated at',
    example: '2025-01-20T15:00:00Z',
  })
  updatedAt: Date;
}
