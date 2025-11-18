import { IsString, IsNumber, IsUUID, IsOptional, Min, Max, IsUrl, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Create Payment Request DTO
 *
 * Request body for creating a new payment.
 */
export class CreatePaymentRequestDto {
  @ApiProperty({
    description: 'User ID',
    example: '11111111-1111-1111-1111-111111111111',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Payment amount',
    example: 3000,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'RUB',
    default: 'RUB',
  })
  @IsString()
  currency: string;

  @ApiProperty({
    description: 'Payment description',
    example: 'Оплата консультации с юристом',
    maxLength: 128,
  })
  @IsString()
  description: string;

  @ApiPropertyOptional({
    description: 'Consultation ID (for consultation payments)',
    example: 'a0000000-0000-0000-0000-000000000001',
  })
  @IsOptional()
  @IsUUID()
  consultationId?: string;

  @ApiPropertyOptional({
    description: 'Subscription ID (for subscription payments)',
    example: 'sub-0000-0000-0000-000000000001',
  })
  @IsOptional()
  @IsUUID()
  subscriptionId?: string;

  @ApiPropertyOptional({
    description: 'Return URL after payment',
    example: 'https://advocata.app/payment/success',
  })
  @IsOptional()
  @IsUrl()
  returnUrl?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { source: 'mobile_app', version: '1.0.0' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
