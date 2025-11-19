import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateNotificationTemplateDto {
  @ApiPropertyOptional({ description: 'Email subject (for email templates)' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({ description: 'Plain text body' })
  @IsOptional()
  @IsString()
  bodyText?: string;

  @ApiPropertyOptional({ description: 'HTML body (for email templates)' })
  @IsOptional()
  @IsString()
  bodyHtml?: string;

  @ApiPropertyOptional({ description: 'Is template active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
