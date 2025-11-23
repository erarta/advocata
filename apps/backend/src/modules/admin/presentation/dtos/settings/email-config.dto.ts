import { IsString, IsOptional, IsBoolean, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateEmailConfigDto {
  @ApiProperty({ description: 'Email provider', enum: ['smtp', 'sendgrid', 'mailgun', 'ses'] })
  @IsEnum(['smtp', 'sendgrid', 'mailgun', 'ses'])
  provider: 'smtp' | 'sendgrid' | 'mailgun' | 'ses';

  @ApiPropertyOptional({ description: 'Enable email service' })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiPropertyOptional({ description: 'From email address' })
  @IsOptional()
  @IsString()
  fromEmail?: string;

  @ApiPropertyOptional({ description: 'From name' })
  @IsOptional()
  @IsString()
  fromName?: string;

  @ApiPropertyOptional({ description: 'Reply-to email address' })
  @IsOptional()
  @IsString()
  replyToEmail?: string;

  @ApiPropertyOptional({ description: 'SMTP host' })
  @IsOptional()
  @IsString()
  smtpHost?: string;

  @ApiPropertyOptional({ description: 'SMTP port' })
  @IsOptional()
  @IsNumber()
  smtpPort?: number;

  @ApiPropertyOptional({ description: 'Use secure connection' })
  @IsOptional()
  @IsBoolean()
  smtpSecure?: boolean;

  @ApiPropertyOptional({ description: 'SMTP username' })
  @IsOptional()
  @IsString()
  smtpUsername?: string;

  @ApiPropertyOptional({ description: 'SMTP password' })
  @IsOptional()
  @IsString()
  smtpPassword?: string;

  @ApiPropertyOptional({ description: 'API key (for SendGrid/Mailgun/SES)' })
  @IsOptional()
  @IsString()
  apiKey?: string;
}
