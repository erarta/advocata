import { IsEnum, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConsultationStatus } from './get-consultations.dto';

export class UpdateConsultationStatusDto {
  @ApiProperty({ enum: ConsultationStatus, description: 'New consultation status' })
  @IsEnum(ConsultationStatus)
  status: ConsultationStatus;

  @ApiPropertyOptional({ description: 'Reason for status change' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
