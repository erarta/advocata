import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { CapturePaymentCommand } from './capture-payment.command';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from '../../../domain/repositories/payment.repository.interface';
import { IYooKassaClient, YOOKASSA_CLIENT } from '../../../infrastructure/services/yookassa-client.interface';
import { PaymentMethod } from '../../../domain/value-objects/payment-method.vo';

/**
 * Capture Payment Command Handler
 *
 * Handles the command to capture (confirm) a payment.
 * Used for two-step payment flow.
 */
@Injectable()
@CommandHandler(CapturePaymentCommand)
export class CapturePaymentHandler
  implements ICommandHandler<CapturePaymentCommand>
{
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(YOOKASSA_CLIENT)
    private readonly yooKassaClient: IYooKassaClient,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CapturePaymentCommand): Promise<any> {
    const { paymentId, amount } = command;

    // 1. Find payment
    const payment = await this.paymentRepository.findById(paymentId);

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // 2. Check if payment can be captured
    if (!payment.canBeCaptured) {
      throw new BadRequestException(
        `Payment cannot be captured in status: ${payment.status}`,
      );
    }

    // 3. Capture payment in YooKassa
    try {
      const captureAmountKopecks = amount
        ? Math.round(amount * 100)
        : payment.amount.amountInKopecks;

      const yooKassaPayment = await this.yooKassaClient.capturePayment(
        payment.yooKassaPaymentId!,
        captureAmountKopecks,
      );

      // 4. Update payment status
      const completeResult = payment.complete(
        yooKassaPayment.paymentMethod as PaymentMethod,
      );

      if (completeResult.isFailure) {
        throw new Error(completeResult.error);
      }

      // 5. Save updated payment
      await this.paymentRepository.save(payment);

      // 6. Publish domain events
      payment.domainEvents.forEach((event) => this.eventBus.publish(event));

      // 7. Return result
      return {
        id: payment.id,
        status: payment.status,
        amount: payment.amount.amount,
        currency: payment.amount.currency,
        method: payment.method,
        completedAt: payment.completedAt,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to capture payment in YooKassa: ${error.message}`,
      );
    }
  }
}
