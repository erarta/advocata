import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus } from '../../domain/value-objects/payment-status.vo';
import { PaymentMethod } from '../../domain/value-objects/payment-method.vo';

/**
 * Payment Response DTO
 *
 * Response format for payment data.
 */
export class PaymentResponseDto {
  @ApiProperty({
    description: 'Payment ID',
    example: 'pay-0001-0000-0000-0000-000000000001',
  })
  id: string;

  @ApiProperty({
    description: 'User ID',
    example: '11111111-1111-1111-1111-111111111111',
  })
  userId: string;

  @ApiPropertyOptional({
    description: 'Consultation ID',
    example: 'a0000000-0000-0000-0000-000000000001',
  })
  consultationId?: string;

  @ApiPropertyOptional({
    description: 'Subscription ID',
    example: 'sub-0000-0000-0000-000000000001',
  })
  subscriptionId?: string;

  @ApiProperty({
    description: 'Payment amount',
    example: 3000,
  })
  amount: number;

  @ApiProperty({
    description: 'Currency',
    example: 'RUB',
  })
  currency: string;

  @ApiProperty({
    description: 'Payment status',
    enum: PaymentStatus,
    example: PaymentStatus.SUCCEEDED,
  })
  status: PaymentStatus;

  @ApiPropertyOptional({
    description: 'Payment method',
    enum: PaymentMethod,
    example: PaymentMethod.BANK_CARD,
  })
  method?: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Payment description',
    example: 'Оплата консультации с юристом',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'YooKassa payment ID',
    example: '2d9f5b42-000f-5000-8000-13b4e5f73b3d',
  })
  yooKassaPaymentId?: string;

  @ApiPropertyOptional({
    description: 'Payment confirmation URL',
    example: 'https://yoomoney.ru/checkout/payments/v2/contract?orderId=...',
  })
  confirmationUrl?: string;

  @ApiPropertyOptional({
    description: 'Refunded amount',
    example: 1500,
  })
  refundedAmount?: number;

  @ApiPropertyOptional({
    description: 'Failure reason',
    example: 'Insufficient funds',
  })
  failureReason?: string;

  @ApiPropertyOptional({
    description: 'Lawyer payout amount (after commission)',
    example: 2700,
  })
  lawyerPayout?: number;

  @ApiPropertyOptional({
    description: 'Platform commission amount',
    example: 300,
  })
  platformCommission?: number;

  @ApiPropertyOptional({
    description: 'Additional metadata',
  })
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'Payment creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Payment last update timestamp',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Payment completion timestamp',
  })
  completedAt?: Date;

  @ApiPropertyOptional({
    description: 'Payment cancellation timestamp',
  })
  canceledAt?: Date;

  @ApiPropertyOptional({
    description: 'Payment refund timestamp',
  })
  refundedAt?: Date;
}

/**
 * Paginated Payments Response DTO
 */
export class PaginatedPaymentsResponseDto {
  @ApiProperty({
    description: 'Array of payments',
    type: [PaymentResponseDto],
  })
  items: PaymentResponseDto[];

  @ApiProperty({
    description: 'Total count of payments',
    example: 42,
  })
  total: number;

  @ApiProperty({
    description: 'Limit (page size)',
    example: 50,
  })
  limit: number;

  @ApiProperty({
    description: 'Offset (starting position)',
    example: 0,
  })
  offset: number;

  @ApiProperty({
    description: 'Whether there are more payments',
    example: false,
  })
  hasMore: boolean;

  @ApiPropertyOptional({
    description: 'User payment statistics',
  })
  statistics?: {
    totalPaid: number;
    totalConsultations: number;
    averagePayment: number;
    currency: string;
  };
}
