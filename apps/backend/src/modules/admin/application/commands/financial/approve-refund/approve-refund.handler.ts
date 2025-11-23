import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApproveRefundCommand } from './approve-refund.command';
import { PaymentOrmEntity } from '../../../../../payment/infrastructure/persistence/payment.orm-entity';
import { RefundRepository } from '../../../../infrastructure/persistence/refund.repository';
import { RefundStatus } from '../../../../infrastructure/persistence/refund.orm-entity';
import { AuditLogService } from '../../../services/audit-log.service';

interface ApproveRefundResult {
  success: boolean;
  message: string;
}

@CommandHandler(ApproveRefundCommand)
export class ApproveRefundHandler implements ICommandHandler<ApproveRefundCommand> {
  private readonly logger = new Logger(ApproveRefundHandler.name);

  constructor(
    @InjectRepository(PaymentOrmEntity)
    private readonly paymentRepository: Repository<PaymentOrmEntity>,
    private readonly refundRepository: RefundRepository,
    private readonly auditLogService: AuditLogService,
  ) {}

  async execute(command: ApproveRefundCommand): Promise<ApproveRefundResult> {
    const { refundId, dto } = command;

    // Find refund in database
    const refund = await this.refundRepository.findById(refundId);
    if (!refund) {
      // Fallback: treat refundId as paymentId for backward compatibility
      const payment = await this.paymentRepository.findOne({ where: { id: refundId } });
      if (!payment) {
        throw new NotFoundException(`Refund or Payment with ID ${refundId} not found`);
      }

      // Validate payment can be refunded
      if (payment.status !== 'succeeded') {
        throw new BadRequestException('Only succeeded payments can be refunded');
      }

      if (payment.refundedAmount && Number(payment.refundedAmount) >= Number(payment.amount)) {
        throw new BadRequestException('Payment already fully refunded');
      }

      // Calculate refund amount (full refund)
      const refundAmount = Number(payment.amount) - Number(payment.refundedAmount || 0);

      // Update payment record
      payment.refundedAmount = payment.amount;
      payment.status = 'refunded';
      payment.refundedAt = new Date();
      payment.metadata = {
        ...payment.metadata,
        refundNotes: dto.notes,
        refundApprovedAt: new Date().toISOString(),
      };

      await this.paymentRepository.save(payment);

      this.logger.log(`[LEGACY] Approved refund for payment ${refundId}: ${refundAmount} RUB`);

      return {
        success: true,
        message: `Refund of ${refundAmount} RUB approved and processed successfully`,
      };
    }

    // Validate refund status
    if (refund.status !== RefundStatus.PENDING) {
      throw new BadRequestException('Only pending refunds can be approved');
    }

    // Find original payment
    const payment = await this.paymentRepository.findOne({
      where: { id: refund.paymentId },
    });
    if (!payment) {
      throw new NotFoundException('Original payment not found');
    }

    // Validate refund amount
    const currentRefunded = Number(payment.refundedAmount || 0);
    if (currentRefunded + refund.amount > Number(payment.amount)) {
      throw new BadRequestException('Total refund amount would exceed payment amount');
    }

    // Update refund status
    refund.status = RefundStatus.APPROVED;
    refund.approvedBy = dto.adminUserId; // TODO: Get from request context
    refund.approvedAt = new Date();

    // TODO: Process refund with payment gateway (ЮКасса)
    // const yooKassaRefund = await this.yooKassaService.createRefund({
    //   paymentId: payment.yooKassaPaymentId,
    //   amount: refund.amount,
    //   description: dto.notes,
    // });
    // refund.yooKassaRefundId = yooKassaRefund.id;

    await this.refundRepository.save(refund);

    // Update payment record
    payment.refundedAmount = currentRefunded + refund.amount;
    if (payment.refundedAmount >= Number(payment.amount)) {
      payment.status = 'refunded';
      payment.refundedAt = new Date();
    }
    await this.paymentRepository.save(payment);

    // Log audit trail
    await this.auditLogService.logRefundDecision(
      dto.adminUserId || 'system',
      refundId,
      true,
      refund.amount,
      dto.notes,
    );

    this.logger.log(`Refund ${refundId} approved: ${refund.amount} RUB for payment ${refund.paymentId}`);

    // TODO: Send notification to user
    // await this.notificationService.sendRefundApprovalNotification(refund);

    return {
      success: true,
      message: 'Refund approved and processed successfully',
    };
  }
}
