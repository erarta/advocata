import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CancelPaymentCommand } from './cancel-payment.command';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from '../../../domain/repositories/payment.repository.interface';
import { IYooKassaClient, YOOKASSA_CLIENT } from '../../../infrastructure/services/yookassa-client.interface';

/**
 * Cancel Payment Command Handler
 *
 * Handles the command to cancel a pending payment.
 */
@Injectable()
@CommandHandler(CancelPaymentCommand)
export class CancelPaymentHandler
  implements ICommandHandler<CancelPaymentCommand>
{
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(YOOKASSA_CLIENT)
    private readonly yooKassaClient: IYooKassaClient,
  ) {}

  async execute(command: CancelPaymentCommand): Promise<any> {
    const { paymentId } = command;

    // 1. Find payment
    const payment = await this.paymentRepository.findById(paymentId);

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // 2. Check if payment can be canceled
    if (!payment.canBeCanceled) {
      throw new BadRequestException(
        `Payment cannot be canceled in status: ${payment.status}`,
      );
    }

    // 3. Cancel payment in YooKassa
    try {
      await this.yooKassaClient.cancelPayment(payment.yooKassaPaymentId!);

      // 4. Update payment status
      const cancelResult = payment.cancel();

      if (cancelResult.isFailure) {
        throw new Error(cancelResult.error);
      }

      // 5. Save updated payment
      await this.paymentRepository.save(payment);

      // 6. Return result
      return {
        id: payment.id,
        status: payment.status,
        canceledAt: payment.canceledAt,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to cancel payment in YooKassa: ${error.message}`,
      );
    }
  }
}
