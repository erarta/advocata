import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum DateRange {
  TODAY = 'today',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
  CUSTOM = 'custom',
}

export class DashboardMetricsDto {
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
