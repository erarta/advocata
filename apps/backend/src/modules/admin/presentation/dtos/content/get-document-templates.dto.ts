import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum DocumentTemplateCategory {
  TRAFFIC_ACCIDENT = 'traffic_accident',
  LABOR_LAW = 'labor_law',
  FAMILY_LAW = 'family_law',
  CRIMINAL_LAW = 'criminal_law',
  HOUSING_LAW = 'housing_law',
  CIVIL_LAW = 'civil_law',
  ADMINISTRATIVE_LAW = 'administrative_law',
  OTHER = 'other',
}

export enum DocumentTemplateStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
}

export class GetDocumentTemplatesDto {
  @ApiPropertyOptional({ enum: DocumentTemplateCategory, description: 'Filter by category' })
  @IsOptional()
  @IsEnum(DocumentTemplateCategory)
  category?: DocumentTemplateCategory;

  @ApiPropertyOptional({ enum: DocumentTemplateStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(DocumentTemplateStatus)
  status?: DocumentTemplateStatus;

  @ApiPropertyOptional({ description: 'Filter by premium status' })
  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;

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
