import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum LegalPageType {
  ABOUT = 'about',
  PRIVACY_POLICY = 'privacy_policy',
  TERMS_OF_SERVICE = 'terms_of_service',
  USER_AGREEMENT = 'user_agreement',
  LAWYER_AGREEMENT = 'lawyer_agreement',
  REFUND_POLICY = 'refund_policy',
  COOKIES_POLICY = 'cookies_policy',
  CUSTOM = 'custom',
}

export enum LegalPageStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  SCHEDULED = 'scheduled',
}

export class CreateLegalInfoPageDto {
  @ApiProperty({ description: 'Page title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'URL slug' })
  @IsString()
  slug: string;

  @ApiProperty({ description: 'Page content' })
  @IsString()
  content: string;

  @ApiProperty({ enum: LegalPageType, description: 'Page type' })
  @IsEnum(LegalPageType)
  type: LegalPageType;

  @ApiPropertyOptional({ description: 'SEO title' })
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiPropertyOptional({ description: 'SEO description' })
  @IsOptional()
  @IsString()
  seoDescription?: string;

  @ApiPropertyOptional({ description: 'SEO keywords' })
  @IsOptional()
  @IsString()
  seoKeywords?: string;
}

export class UpdateLegalInfoPageDto {
  @ApiPropertyOptional({ description: 'Page title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'URL slug' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: 'Page content' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ enum: LegalPageType, description: 'Page type' })
  @IsOptional()
  @IsEnum(LegalPageType)
  type?: LegalPageType;

  @ApiPropertyOptional({ enum: LegalPageStatus, description: 'Page status' })
  @IsOptional()
  @IsEnum(LegalPageStatus)
  status?: LegalPageStatus;

  @ApiPropertyOptional({ description: 'SEO title' })
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiPropertyOptional({ description: 'SEO description' })
  @IsOptional()
  @IsString()
  seoDescription?: string;

  @ApiPropertyOptional({ description: 'SEO keywords' })
  @IsOptional()
  @IsString()
  seoKeywords?: string;
}

export class GetLegalInfoPagesDto {
  @ApiPropertyOptional({ enum: LegalPageStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(LegalPageStatus)
  status?: LegalPageStatus;

  @ApiPropertyOptional({ enum: LegalPageType, description: 'Filter by type' })
  @IsOptional()
  @IsEnum(LegalPageType)
  type?: LegalPageType;

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
