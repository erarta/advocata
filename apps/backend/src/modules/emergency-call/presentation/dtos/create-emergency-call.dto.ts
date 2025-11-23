import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

/**
 * DTO for creating an emergency call
 */
export class CreateEmergencyCallDto {
  @ApiProperty({
    description: 'User ID requesting emergency call',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Latitude of emergency location',
    example: 59.9311,
    minimum: -90,
    maximum: 90,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({
    description: 'Longitude of emergency location',
    example: 30.3609,
    minimum: -180,
    maximum: 180,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiProperty({
    description: 'Address of emergency location',
    example: 'Nevsky Prospect, 1, St. Petersburg, Russia',
  })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({
    description: 'Additional notes about the emergency',
    example: 'Car accident, need immediate assistance',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
