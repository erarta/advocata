import { IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SpecializationAnalyticsDto {
  // No specific filters needed for now, but keeping for future extensibility
  @ApiPropertyOptional({ description: 'Reserved for future filters' })
  @IsOptional()
  placeholder?: string;
}
