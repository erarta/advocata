import { IsBoolean, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VerifyLawyerDto {
  @ApiProperty({ description: 'Verification decision' })
  @IsBoolean()
  verified: boolean;

  @ApiPropertyOptional({ description: 'Verification notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Rejection reason (if not verified)' })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
