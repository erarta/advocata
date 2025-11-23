import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum FaqCategory {
  GENERAL = 'general',
  FOR_LAWYERS = 'for_lawyers',
  FOR_CLIENTS = 'for_clients',
  PAYMENTS = 'payments',
  TECHNICAL = 'technical',
}

export enum FaqStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export class GetFaqsDto {
  @ApiPropertyOptional({ enum: FaqCategory, description: 'Filter by category' })
  @IsOptional()
  @IsEnum(FaqCategory)
  category?: FaqCategory;

  @ApiPropertyOptional({ enum: FaqStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(FaqStatus)
  status?: FaqStatus;

  @ApiPropertyOptional({ description: 'Search query' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  limit?: number = 20;
}
