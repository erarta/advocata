import { IsString, IsOptional, IsEnum, IsArray, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { LawyerStatus } from './get-lawyers.dto';

export class UpdateLawyerDto {
  @ApiPropertyOptional({ description: 'Lawyer first name' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Lawyer last name' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ description: 'Lawyer phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ enum: LawyerStatus, description: 'Lawyer status' })
  @IsOptional()
  @IsEnum(LawyerStatus)
  status?: LawyerStatus;

  @ApiPropertyOptional({
    description: 'Specializations',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specializations?: string[];

  @ApiPropertyOptional({ description: 'Hourly rate' })
  @IsOptional()
  @IsNumber()
  hourlyRate?: number;

  @ApiPropertyOptional({ description: 'Bio' })
  @IsOptional()
  @IsString()
  bio?: string;
}
