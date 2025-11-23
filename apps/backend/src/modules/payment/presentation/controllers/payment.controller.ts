import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  Delete,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import {
  CacheInterceptor,
  CacheKey,
  CacheTTL,
  CacheInvalidate,
} from '../../../../shared/infrastructure/cache';
import { CreatePaymentCommand } from '../../application/commands/create-payment/create-payment.command';
import { CapturePaymentCommand } from '../../application/commands/capture-payment/capture-payment.command';
import { CancelPaymentCommand } from '../../application/commands/cancel-payment/cancel-payment.command';
import { RefundPaymentCommand } from '../../application/commands/refund-payment/refund-payment.command';
import { GetPaymentQuery } from '../../application/queries/get-payment/get-payment.query';
import { GetUserPaymentsQuery } from '../../application/queries/get-user-payments/get-user-payments.query';
import { CreatePaymentRequestDto } from '../dtos/create-payment.request.dto';
import { RefundPaymentRequestDto } from '../dtos/refund-payment.request.dto';
import {
  PaymentResponseDto,
  PaginatedPaymentsResponseDto,
} from '../dtos/payment.response.dto';
import { PaymentStatus } from '../../domain/value-objects/payment-status.vo';

/**
 * Payment Controller
 *
 * REST API controller for payment operations.
 * Handles payment creation, retrieval, and management.
 */
@ApiTags('payments')
@Controller('api/v1/payments')
@UseInterceptors(CacheInterceptor)
export class PaymentController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Create a new payment
   *
   * POST /api/v1/payments
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Payment created successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid payment data',
  })
  @CacheInvalidate((req) => [`payments:user:${req.body.userId}:*`])
  async createPayment(
    @Body() dto: CreatePaymentRequestDto,
  ): Promise<PaymentResponseDto> {
    const command = new CreatePaymentCommand(
      dto.userId,
      dto.amount,
      dto.currency,
      dto.description,
      dto.consultationId,
      dto.subscriptionId,
      dto.returnUrl,
      dto.metadata,
    );

    return await this.commandBus.execute(command);
  }

  /**
   * Get payment by ID
   *
   * GET /api/v1/payments/:id
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiParam({
    name: 'id',
    description: 'Payment ID',
    example: 'pay-0001-0000-0000-0000-000000000001',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'User ID (for authorization check)',
    example: '11111111-1111-1111-1111-111111111111',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment retrieved successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Payment not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied',
  })
  @CacheKey((req) => `payment:${req.params.id}`)
  @CacheTTL(600) // 10 minutes - payments are immutable
  async getPayment(
    @Param('id') id: string,
    @Query('userId') userId?: string,
  ): Promise<PaymentResponseDto> {
    const query = new GetPaymentQuery(id, userId);

    return await this.queryBus.execute(query);
  }

  /**
   * Get user payments
   *
   * GET /api/v1/payments/user/:userId
   */
  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get payments for a user' })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    example: '11111111-1111-1111-1111-111111111111',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by payment status',
    enum: PaymentStatus,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of payments to return',
    example: 50,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Offset for pagination',
    example: 0,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payments retrieved successfully',
    type: PaginatedPaymentsResponseDto,
  })
  @CacheKey((req) => `payments:user:${req.params.userId}:${JSON.stringify(req.query)}`)
  @CacheTTL(180) // 3 minutes
  async getUserPayments(
    @Param('userId') userId: string,
    @Query('status') status?: PaymentStatus,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<PaginatedPaymentsResponseDto> {
    const query = new GetUserPaymentsQuery(
      userId,
      status,
      limit ? Number(limit) : 50,
      offset ? Number(offset) : 0,
    );

    return await this.queryBus.execute(query);
  }

  /**
   * Capture payment (confirm two-step payment)
   *
   * POST /api/v1/payments/:id/capture
   */
  @Post(':id/capture')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Capture (confirm) a payment' })
  @ApiParam({
    name: 'id',
    description: 'Payment ID',
    example: 'pay-0001-0000-0000-0000-000000000001',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment captured successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Payment not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Payment cannot be captured in current status',
  })
  @CacheInvalidate((req) => [
    `payment:${req.params.id}`,
    'payments:user:*',
  ])
  async capturePayment(@Param('id') id: string): Promise<any> {
    const command = new CapturePaymentCommand(id);

    return await this.commandBus.execute(command);
  }

  /**
   * Cancel payment
   *
   * POST /api/v1/payments/:id/cancel
   */
  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a pending payment' })
  @ApiParam({
    name: 'id',
    description: 'Payment ID',
    example: 'pay-0001-0000-0000-0000-000000000001',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment canceled successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Payment not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Payment cannot be canceled in current status',
  })
  @CacheInvalidate((req) => [
    `payment:${req.params.id}`,
    'payments:user:*',
  ])
  async cancelPayment(@Param('id') id: string): Promise<any> {
    const command = new CancelPaymentCommand(id);

    return await this.commandBus.execute(command);
  }

  /**
   * Refund payment
   *
   * POST /api/v1/payments/:id/refund
   */
  @Post(':id/refund')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refund a completed payment' })
  @ApiParam({
    name: 'id',
    description: 'Payment ID',
    example: 'pay-0001-0000-0000-0000-000000000001',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment refunded successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Payment not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Payment cannot be refunded in current status',
  })
  @CacheInvalidate((req) => [
    `payment:${req.params.id}`,
    'payments:user:*',
  ])
  async refundPayment(
    @Param('id') id: string,
    @Body() dto: RefundPaymentRequestDto,
  ): Promise<any> {
    const command = new RefundPaymentCommand(
      id,
      dto.refundAmount,
      dto.reason,
    );

    return await this.commandBus.execute(command);
  }
}
