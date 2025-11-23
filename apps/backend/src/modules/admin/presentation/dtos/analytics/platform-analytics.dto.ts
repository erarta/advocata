import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DateRange } from './dashboard-metrics.dto';

export class PlatformAnalyticsDto {
  @ApiPropertyOptional({ enum: DateRange, description: 'Date range filter' })
  @IsOptional()
  @IsEnum(DateRange)
  dateRange?: DateRange;

  @ApiPropertyOptional({ description: 'Start date for custom range (ISO format)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for custom range (ISO format)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
