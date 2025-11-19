import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GeographicAnalyticsDto {
  @ApiPropertyOptional({ description: 'Filter by city name' })
  @IsOptional()
  @IsString()
  city?: string;
}
