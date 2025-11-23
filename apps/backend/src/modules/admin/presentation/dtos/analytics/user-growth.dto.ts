import { IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TimePeriod } from './revenue-metrics.dto';

export class UserGrowthDto {
  @ApiPropertyOptional({ description: 'Start date (ISO format)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date (ISO format)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ enum: TimePeriod, description: 'Time period grouping' })
  @IsOptional()
  @IsEnum(TimePeriod)
  groupBy?: TimePeriod = TimePeriod.MONTH;
}
