import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { RefundPaymentCommand } from './refund-payment.command';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from '../../../domain/repositories/payment.repository.interface';
import { IYooKassaClient, YOOKASSA_CLIENT } from '../../../infrastructure/services/yookassa-client.interface';
import { Money } from '../../../domain/value-objects/money.vo';

/**
 * Refund Payment Command Handler
 *
 * Handles the command to refund a completed payment.
 */
@Injectable()
@CommandHandler(RefundPaymentCommand)
export class RefundPaymentHandler
  implements ICommandHandler<RefundPaymentCommand>
{
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(YOOKASSA_CLIENT)
    private readonly yooKassaClient: IYooKassaClient,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RefundPaymentCommand): Promise<any> {
    const { paymentId, refundAmount, reason } = command;

    // 1. Find payment
    const payment = await this.paymentRepository.findById(paymentId);

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // 2. Check if payment can be refunded
    if (!payment.canBeRefunded) {
      throw new BadRequestException(
        `Payment cannot be refunded in status: ${payment.status}`,
      );
    }

    // 3. Create Money for refund amount
    const refundMoneyResult = Money.create({
      amount: refundAmount,
      currency: payment.amount.currency,
    });

    if (refundMoneyResult.isFailure) {
      throw new BadRequestException(refundMoneyResult.error);
    }

    const refundMoney = refundMoneyResult.getValue();

    // 4. Create refund in YooKassa
    try {
      const yooKassaRefund = await this.yooKassaClient.createRefund({
        paymentId: payment.yooKassaPaymentId!,
        amount: refundMoney.amountInKopecks,
        description: reason,
      });

      // 5. Update payment with refund
      const refundResult = payment.refund(
        yooKassaRefund.id,
        refundMoney,
        reason,
      );

      if (refundResult.isFailure) {
        throw new Error(refundResult.error);
      }

      // 6. Save updated payment
      await this.paymentRepository.save(payment);

      // 7. Publish domain events
      payment.domainEvents.forEach((event) => this.eventBus.publish(event));

      // 8. Return result
      return {
        id: payment.id,
        status: payment.status,
        refundedAmount: payment.refundedAmount?.amount,
        currency: payment.amount.currency,
        refundedAt: payment.refundedAt,
        refundId: yooKassaRefund.id,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to create refund in YooKassa: ${error.message}`,
      );
    }
  }
}
