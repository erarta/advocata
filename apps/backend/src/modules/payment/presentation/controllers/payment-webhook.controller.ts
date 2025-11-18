import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiExcludeEndpoint } from '@nestjs/swagger';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from '../../domain/repositories/payment.repository.interface';
import { PaymentMethod } from '../../domain/value-objects/payment-method.vo';

/**
 * YooKassa Webhook Payload
 */
interface YooKassaWebhookPayload {
  type: string;
  event:
    | 'payment.succeeded'
    | 'payment.waiting_for_capture'
    | 'payment.canceled'
    | 'refund.succeeded';
  object: {
    id: string;
    status: string;
    amount: {
      value: string;
      currency: string;
    };
    payment_method?: {
      type: string;
    };
    metadata?: Record<string, any>;
    created_at: string;
    captured_at?: string;
    canceled_at?: string;
  };
}

/**
 * Payment Webhook Controller
 *
 * Handles webhooks (callbacks) from YooKassa payment gateway.
 * Updates payment status based on YooKassa events.
 */
@ApiTags('webhooks')
@Controller('api/v1/webhooks/payments')
export class PaymentWebhookController {
  private readonly logger = new Logger(PaymentWebhookController.name);

  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    private readonly eventBus: EventBus,
  ) {}

  /**
   * YooKassa webhook endpoint
   *
   * POST /api/v1/webhooks/payments/yookassa
   *
   * This endpoint receives notifications from YooKassa about payment status changes.
   */
  @Post('yookassa')
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint() // Hide from Swagger (internal endpoint)
  @ApiOperation({ summary: 'YooKassa webhook handler' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Webhook processed successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid webhook payload',
  })
  async handleYooKassaWebhook(
    @Body() payload: YooKassaWebhookPayload,
  ): Promise<{ status: string }> {
    this.logger.log(`Received YooKassa webhook: ${payload.event}`);
    this.logger.debug(`Webhook payload: ${JSON.stringify(payload)}`);

    try {
      // Validate webhook payload
      if (!payload.object || !payload.object.id) {
        throw new BadRequestException('Invalid webhook payload');
      }

      // Find payment by YooKassa payment ID
      const payment = await this.paymentRepository.findByYooKassaPaymentId(
        payload.object.id,
      );

      if (!payment) {
        this.logger.warn(
          `Payment not found for YooKassa ID: ${payload.object.id}`,
        );
        // Return 200 to acknowledge receipt (don't retry)
        return { status: 'payment_not_found' };
      }

      // Handle different event types
      switch (payload.event) {
        case 'payment.succeeded':
          await this.handlePaymentSucceeded(payment, payload);
          break;

        case 'payment.waiting_for_capture':
          await this.handlePaymentWaitingForCapture(payment, payload);
          break;

        case 'payment.canceled':
          await this.handlePaymentCanceled(payment, payload);
          break;

        case 'refund.succeeded':
          await this.handleRefundSucceeded(payment, payload);
          break;

        default:
          this.logger.warn(`Unknown webhook event type: ${payload.event}`);
      }

      return { status: 'ok' };
    } catch (error) {
      this.logger.error(`Error processing webhook: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle payment.succeeded event
   */
  private async handlePaymentSucceeded(
    payment: any,
    payload: YooKassaWebhookPayload,
  ): Promise<void> {
    this.logger.log(`Processing payment.succeeded for payment ${payment.id}`);

    // Skip if already completed
    if (payment.isCompleted) {
      this.logger.log(`Payment ${payment.id} already completed, skipping`);
      return;
    }

    // Get payment method from payload
    const paymentMethod = this.mapYooKassaMethodToOurs(
      payload.object.payment_method?.type,
    );

    // Complete payment
    const completeResult = payment.complete(paymentMethod);

    if (completeResult.isFailure) {
      this.logger.error(
        `Failed to complete payment ${payment.id}: ${completeResult.error}`,
      );
      return;
    }

    // Save updated payment
    await this.paymentRepository.save(payment);

    // Publish domain events
    payment.domainEvents.forEach((event: any) => this.eventBus.publish(event));

    this.logger.log(`Payment ${payment.id} marked as succeeded`);
  }

  /**
   * Handle payment.waiting_for_capture event (two-step payment)
   */
  private async handlePaymentWaitingForCapture(
    payment: any,
    payload: YooKassaWebhookPayload,
  ): Promise<void> {
    this.logger.log(
      `Processing payment.waiting_for_capture for payment ${payment.id}`,
    );

    const markResult = payment.markAsWaitingForCapture();

    if (markResult.isFailure) {
      this.logger.error(
        `Failed to mark payment ${payment.id} as waiting for capture: ${markResult.error}`,
      );
      return;
    }

    await this.paymentRepository.save(payment);

    this.logger.log(`Payment ${payment.id} marked as waiting for capture`);
  }

  /**
   * Handle payment.canceled event
   */
  private async handlePaymentCanceled(
    payment: any,
    payload: YooKassaWebhookPayload,
  ): Promise<void> {
    this.logger.log(`Processing payment.canceled for payment ${payment.id}`);

    const cancelResult = payment.cancel();

    if (cancelResult.isFailure) {
      this.logger.error(
        `Failed to cancel payment ${payment.id}: ${cancelResult.error}`,
      );
      return;
    }

    await this.paymentRepository.save(payment);

    this.logger.log(`Payment ${payment.id} marked as canceled`);
  }

  /**
   * Handle refund.succeeded event
   */
  private async handleRefundSucceeded(
    payment: any,
    payload: YooKassaWebhookPayload,
  ): Promise<void> {
    this.logger.log(`Processing refund.succeeded for payment ${payment.id}`);

    // Refund is already processed via API call
    // This webhook is just a confirmation
    this.logger.log(`Refund confirmed for payment ${payment.id}`);
  }

  /**
   * Map YooKassa payment method to our PaymentMethod enum
   */
  private mapYooKassaMethodToOurs(
    yooKassaMethod?: string,
  ): PaymentMethod {
    const mapping: Record<string, PaymentMethod> = {
      bank_card: PaymentMethod.BANK_CARD,
      yoo_money: PaymentMethod.YOO_MONEY,
      sberbank: PaymentMethod.SBER_PAY,
      mobile_balance: PaymentMethod.MOBILE_BALANCE,
      cash: PaymentMethod.CASH,
      qiwi: PaymentMethod.QIWI,
      webmoney: PaymentMethod.WEBMONEY,
      apple_pay: PaymentMethod.APPLE_PAY,
      google_pay: PaymentMethod.GOOGLE_PAY,
      installments: PaymentMethod.INSTALLMENTS,
    };

    return mapping[yooKassaMethod || 'bank_card'] || PaymentMethod.BANK_CARD;
  }
}
