import { IsString, IsOptional, IsObject } from 'class-validator';

/**
 * Send Push Notification DTO
 */
export class SendPushDto {
  @IsString()
  deviceToken: string;

  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsObject()
  @IsOptional()
  data?: Record<string, any>;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
