import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSMSConfigDto {
  @ApiProperty({ description: 'SMS provider', enum: ['twilio', 'sms.ru', 'smsc'] })
  @IsEnum(['twilio', 'sms.ru', 'smsc'])
  provider: 'twilio' | 'sms.ru' | 'smsc';

  @ApiPropertyOptional({ description: 'Enable SMS service' })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Sender name' })
  @IsOptional()
  @IsString()
  senderName?: string;

  @ApiPropertyOptional({ description: 'API key' })
  @IsOptional()
  @IsString()
  apiKey?: string;

  @ApiPropertyOptional({ description: 'API secret' })
  @IsOptional()
  @IsString()
  apiSecret?: string;

  @ApiPropertyOptional({ description: 'Twilio Account SID' })
  @IsOptional()
  @IsString()
  twilioAccountSid?: string;

  @ApiPropertyOptional({ description: 'Twilio Auth Token' })
  @IsOptional()
  @IsString()
  twilioAuthToken?: string;

  @ApiPropertyOptional({ description: 'Twilio Phone Number' })
  @IsOptional()
  @IsString()
  twilioPhoneNumber?: string;
}
