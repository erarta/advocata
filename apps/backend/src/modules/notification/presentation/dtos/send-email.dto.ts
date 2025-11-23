import { IsString, IsEmail, IsOptional, IsObject } from 'class-validator';

/**
 * Send Email DTO
 */
export class SendEmailDto {
  @IsEmail()
  to: string;

  @IsString()
  subject: string;

  @IsString()
  body: string;

  @IsString()
  @IsOptional()
  html?: string;

  @IsString()
  @IsOptional()
  templateId?: string;

  @IsObject()
  @IsOptional()
  templateData?: Record<string, any>;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
