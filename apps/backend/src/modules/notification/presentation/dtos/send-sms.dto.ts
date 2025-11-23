import { IsString, IsPhoneNumber, IsOptional, IsObject } from 'class-validator';

/**
 * Send SMS DTO
 */
export class SendSmsDto {
  @IsPhoneNumber()
  to: string;

  @IsString()
  message: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
