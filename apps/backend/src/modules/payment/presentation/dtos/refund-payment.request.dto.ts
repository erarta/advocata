import { IsNumber, IsString, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Refund Payment Request DTO
 *
 * Request body for refunding a payment.
 */
export class RefundPaymentRequestDto {
  @ApiProperty({
    description: 'Refund amount',
    example: 1500,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  refundAmount: number;

  @ApiPropertyOptional({
    description: 'Refund reason',
    example: 'Консультация не состоялась по вине юриста',
    maxLength: 250,
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
