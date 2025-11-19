import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApproveRefundCommand } from './approve-refund.command';
import { PaymentOrmEntity } from '../../../../../payment/infrastructure/persistence/payment.orm-entity';

interface ApproveRefundResult {
  success: boolean;
  message: string;
}

@CommandHandler(ApproveRefundCommand)
export class ApproveRefundHandler implements ICommandHandler<ApproveRefundCommand> {
  constructor(
    @InjectRepository(PaymentOrmEntity)
    private readonly paymentRepository: Repository<PaymentOrmEntity>,
  ) {}

  async execute(command: ApproveRefundCommand): Promise<ApproveRefundResult> {
    const { refundId, dto } = command;

    // TODO: When refund table exists, find refund by ID
    // For now, treat refundId as paymentId
    const payment = await this.paymentRepository.findOne({
      where: { id: refundId },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${refundId} not found`);
    }

    // Validate payment can be refunded
    if (payment.status !== 'succeeded') {
      throw new BadRequestException('Only succeeded payments can be refunded');
    }

    if (payment.refundedAmount && Number(payment.refundedAmount) >= Number(payment.amount)) {
      throw new BadRequestException('Payment already fully refunded');
    }

    // Calculate refund amount (full refund for now)
    const refundAmount = Number(payment.amount) - Number(payment.refundedAmount || 0);

    // TODO: Integrate with ЮКасса for actual refund processing
    // TODO: Create refund record in refund table
    // TODO: Update payment status and refundedAmount
    // TODO: Send notification to client

    // For now, update payment record
    payment.refundedAmount = payment.amount;
    payment.status = 'refunded';
    payment.refundedAt = new Date();
    payment.metadata = {
      ...payment.metadata,
      refundNotes: dto.notes,
      refundApprovedAt: new Date().toISOString(),
    };

    await this.paymentRepository.save(payment);

    console.log(`[REFUND] Approved refund for payment ${refundId}`, {
      amount: refundAmount,
      notes: dto.notes,
    });

    return {
      success: true,
      message: `Refund of ${refundAmount} RUB approved and processed successfully`,
    };
  }
}
