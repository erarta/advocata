import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePlatformConfigDto {
  @ApiPropertyOptional({ description: 'Platform name' })
  @IsOptional()
  @IsString()
  platformName?: string;

  @ApiPropertyOptional({ description: 'Enable maintenance mode' })
  @IsOptional()
  @IsBoolean()
  maintenanceMode?: boolean;

  @ApiPropertyOptional({ description: 'Allow new user registrations' })
  @IsOptional()
  @IsBoolean()
  allowRegistrations?: boolean;

  @ApiPropertyOptional({ description: 'Require email verification' })
  @IsOptional()
  @IsBoolean()
  requireEmailVerification?: boolean;

  @ApiPropertyOptional({ description: 'Default language' })
  @IsOptional()
  @IsString()
  defaultLanguage?: string;

  @ApiPropertyOptional({ description: 'Platform fee percentage' })
  @IsOptional()
  @IsNumber()
  platformFeePercentage?: number;

  @ApiPropertyOptional({ description: 'Minimum consultation price' })
  @IsOptional()
  @IsNumber()
  minimumConsultationPrice?: number;
}
