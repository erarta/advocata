import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for emergency call response
 */
export class EmergencyCallResponseDto {
  @ApiProperty({
    description: 'Emergency call ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'Lawyer ID (if accepted)',
    example: '123e4567-e89b-12d3-a456-426614174001',
    nullable: true,
  })
  lawyerId: string | null;

  @ApiProperty({
    description: 'Latitude',
    example: 59.9311,
  })
  latitude: number;

  @ApiProperty({
    description: 'Longitude',
    example: 30.3609,
  })
  longitude: number;

  @ApiProperty({
    description: 'Address',
    example: 'Nevsky Prospect, 1, St. Petersburg, Russia',
  })
  address: string;

  @ApiProperty({
    description: 'Call status',
    enum: ['pending', 'accepted', 'completed', 'cancelled'],
    example: 'pending',
  })
  status: string;

  @ApiProperty({
    description: 'Additional notes',
    example: 'Car accident',
    nullable: true,
  })
  notes: string | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-11-18T12:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Acceptance timestamp',
    example: '2025-11-18T12:05:00Z',
    nullable: true,
  })
  acceptedAt: Date | null;

  @ApiProperty({
    description: 'Completion timestamp',
    example: '2025-11-18T13:00:00Z',
    nullable: true,
  })
  completedAt: Date | null;
}
