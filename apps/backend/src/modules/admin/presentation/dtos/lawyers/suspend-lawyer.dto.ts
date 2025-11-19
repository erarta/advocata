import { IsString, IsOptional, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SuspendLawyerDto {
  @ApiProperty({ description: 'Reason for suspension' })
  @IsString()
  reason: string;

  @ApiPropertyOptional({ description: 'Suspension duration in days (null for indefinite)' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  durationDays?: number;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
