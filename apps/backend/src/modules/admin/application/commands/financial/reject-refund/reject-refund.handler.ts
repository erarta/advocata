import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RejectRefundCommand } from './reject-refund.command';
import { PaymentOrmEntity } from '../../../../../payment/infrastructure/persistence/payment.orm-entity';

interface RejectRefundResult {
  success: boolean;
  message: string;
}

@CommandHandler(RejectRefundCommand)
export class RejectRefundHandler implements ICommandHandler<RejectRefundCommand> {
  constructor(
    @InjectRepository(PaymentOrmEntity)
    private readonly paymentRepository: Repository<PaymentOrmEntity>,
  ) {}

  async execute(command: RejectRefundCommand): Promise<RejectRefundResult> {
    const { refundId, dto } = command;

    // Validate reason
    if (!dto.reason || dto.reason.trim().length < 10) {
      throw new BadRequestException('Rejection reason must be at least 10 characters');
    }

    // TODO: When refund table exists, find refund by ID and update status
    // For now, just log the rejection
    const payment = await this.paymentRepository.findOne({
      where: { id: refundId },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${refundId} not found`);
    }

    // TODO: Update refund record status to 'rejected'
    // TODO: Store rejection reason
    // TODO: Send notification to client

    payment.metadata = {
      ...payment.metadata,
      refundRejected: true,
      refundRejectionReason: dto.reason,
      refundRejectedAt: new Date().toISOString(),
    };

    await this.paymentRepository.save(payment);

    console.log(`[REFUND] Rejected refund request for payment ${refundId}`, {
      reason: dto.reason,
    });

    return {
      success: true,
      message: 'Refund request rejected successfully',
    };
  }
}
