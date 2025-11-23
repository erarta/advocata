import { IsOptional, IsEnum, IsDateString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DateRange } from './dashboard-metrics.dto';

export class LawyerPerformanceDto {
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

  @ApiPropertyOptional({ description: 'Specific lawyer ID to analyze' })
  @IsOptional()
  @IsUUID()
  lawyerId?: string;
}
