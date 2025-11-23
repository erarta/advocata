import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// Infrastructure
import { PaymentOrmEntity } from './infrastructure/persistence/payment.orm-entity';
import { PaymentRepository } from './infrastructure/persistence/payment.repository';
import { PAYMENT_REPOSITORY } from './domain/repositories/payment.repository.interface';
import { YooKassaClient } from './infrastructure/services/yookassa.client';
import { YOOKASSA_CLIENT } from './infrastructure/services/yookassa-client.interface';

// Application - Commands
import { CreatePaymentHandler } from './application/commands/create-payment/create-payment.handler';
import { CapturePaymentHandler } from './application/commands/capture-payment/capture-payment.handler';
import { CancelPaymentHandler } from './application/commands/cancel-payment/cancel-payment.handler';
import { RefundPaymentHandler } from './application/commands/refund-payment/refund-payment.handler';

// Application - Queries
import { GetPaymentHandler } from './application/queries/get-payment/get-payment.handler';
import { GetUserPaymentsHandler } from './application/queries/get-user-payments/get-user-payments.handler';

// Presentation
import { PaymentController } from './presentation/controllers/payment.controller';
import { PaymentWebhookController } from './presentation/controllers/payment-webhook.controller';

const commandHandlers = [
  CreatePaymentHandler,
  CapturePaymentHandler,
  CancelPaymentHandler,
  RefundPaymentHandler,
];

const queryHandlers = [GetPaymentHandler, GetUserPaymentsHandler];

const repositories = [
  {
    provide: PAYMENT_REPOSITORY,
    useClass: PaymentRepository,
  },
];

const services = [
  {
    provide: YOOKASSA_CLIENT,
    useClass: YooKassaClient,
  },
];

/**
 * Payment Module
 *
 * Bounded context for Payment functionality.
 * Handles payment processing, refunds, and integration with YooKassa payment gateway.
 *
 * Architecture:
 * - Domain Layer: Payment entity, Money value object, events, repository interface
 * - Application Layer: Commands (Create, Capture, Cancel, Refund), Queries (Get, GetUserPayments)
 * - Infrastructure Layer: YooKassa client, TypeORM repository
 * - Presentation Layer: REST API controller, Webhook controller, DTOs
 *
 * Features:
 * - Payment creation with YooKassa
 * - Two-step payments (authorization + capture)
 * - Payment cancellation
 * - Full and partial refunds
 * - Webhook handling for payment status updates
 * - Platform commission calculation (10%)
 * - Payment statistics and reporting
 */
@Module({
  imports: [
    CqrsModule,
    ConfigModule,
    TypeOrmModule.forFeature([PaymentOrmEntity]),
  ],
  controllers: [PaymentController, PaymentWebhookController],
  providers: [...commandHandlers, ...queryHandlers, ...repositories, ...services],
  exports: [...repositories, ...services],
})
export class PaymentModule {}
