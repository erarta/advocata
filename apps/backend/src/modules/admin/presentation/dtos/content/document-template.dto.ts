import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDocumentTemplateDto {
  @ApiProperty({ description: 'Template title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Template description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Template category' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'Template content' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: 'Is template public', default: true })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = true;

  @ApiPropertyOptional({ description: 'Template tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateDocumentTemplateDto {
  @ApiPropertyOptional({ description: 'Template title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Template description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Template category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Template content' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: 'Is template public' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ description: 'Template tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
