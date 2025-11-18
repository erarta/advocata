import {
  Injectable,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { CreatePaymentCommand } from './create-payment.command';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from '../../../domain/repositories/payment.repository.interface';
import { Payment } from '../../../domain/entities/payment.entity';
import { Money } from '../../../domain/value-objects/money.vo';
import { IYooKassaClient, YOOKASSA_CLIENT } from '../../../infrastructure/services/yookassa-client.interface';

/**
 * Create Payment Command Handler
 *
 * Handles the command to create a new payment.
 * Creates payment in database and initiates payment in YooKassa.
 */
@Injectable()
@CommandHandler(CreatePaymentCommand)
export class CreatePaymentHandler
  implements ICommandHandler<CreatePaymentCommand>
{
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(YOOKASSA_CLIENT)
    private readonly yooKassaClient: IYooKassaClient,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreatePaymentCommand): Promise<any> {
    const {
      userId,
      amount,
      currency,
      description,
      consultationId,
      subscriptionId,
      returnUrl,
      metadata,
    } = command;

    // 1. Validate input
    if (!consultationId && !subscriptionId) {
      throw new BadRequestException(
        'Either consultationId or subscriptionId must be provided',
      );
    }

    // 2. Create Money value object
    const moneyResult = Money.create({ amount, currency });

    if (moneyResult.isFailure) {
      throw new BadRequestException(moneyResult.error);
    }

    const money = moneyResult.getValue();

    // 3. Create Payment entity
    const paymentId = uuidv4();

    const paymentResult = Payment.create(
      paymentId,
      userId,
      money,
      description,
      consultationId,
      subscriptionId,
      metadata,
    );

    if (paymentResult.isFailure) {
      throw new BadRequestException(paymentResult.error);
    }

    const payment = paymentResult.getValue();

    // 4. Create payment in YooKassa
    try {
      const yooKassaPayment = await this.yooKassaClient.createPayment({
        amount: money.amountInKopecks,
        currency: money.currency,
        description,
        metadata: {
          paymentId,
          userId,
          consultationId,
          subscriptionId,
          ...metadata,
        },
        returnUrl: returnUrl || process.env.PAYMENT_RETURN_URL,
      });

      // 5. Update payment with YooKassa details
      const setDetailsResult = payment.setYooKassaDetails(
        yooKassaPayment.id,
        yooKassaPayment.confirmationUrl,
      );

      if (setDetailsResult.isFailure) {
        throw new Error(setDetailsResult.error);
      }

      // 6. Save payment to repository
      await this.paymentRepository.save(payment);

      // 7. Publish domain events
      payment.domainEvents.forEach((event) => this.eventBus.publish(event));

      // 8. Return payment details with confirmation URL
      return {
        id: payment.id,
        userId: payment.userId,
        consultationId: payment.consultationId,
        subscriptionId: payment.subscriptionId,
        amount: payment.amount.amount,
        currency: payment.amount.currency,
        status: payment.status,
        description: payment.description,
        yooKassaPaymentId: payment.yooKassaPaymentId,
        confirmationUrl: payment.yooKassaPaymentUrl,
        createdAt: payment.createdAt,
      };
    } catch (error) {
      // If YooKassa call fails, we should still save the payment
      // but mark it as failed
      await this.paymentRepository.save(payment);

      throw new BadRequestException(
        `Failed to create payment in YooKassa: ${error.message}`,
      );
    }
  }
}
