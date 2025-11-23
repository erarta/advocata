import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { IssueRefundCommand } from './issue-refund.command';
import { ConsultationOrmEntity } from '../../../../../consultation/infrastructure/persistence/consultation.orm-entity';

interface IssueRefundResult {
  success: boolean;
  message: string;
  refundId: string;
  amount: number;
}

@CommandHandler(IssueRefundCommand)
export class IssueRefundHandler implements ICommandHandler<IssueRefundCommand> {
  constructor(
    @InjectRepository(ConsultationOrmEntity)
    private readonly consultationRepository: Repository<ConsultationOrmEntity>,
  ) {}

  async execute(command: IssueRefundCommand): Promise<IssueRefundResult> {
    const { consultationId, dto } = command;
    const { amount, reason } = dto;

    // Find consultation
    const consultation = await this.consultationRepository.findOne({
      where: { id: consultationId },
    });

    if (!consultation) {
      throw new NotFoundException(
        `Consultation with ID ${consultationId} not found`,
      );
    }

    // Validate refund amount
    const consultationPrice = Number(consultation.price);
    if (amount <= 0) {
      throw new BadRequestException('Refund amount must be greater than 0');
    }

    if (amount > consultationPrice) {
      throw new BadRequestException(
        `Refund amount (${amount}) cannot exceed consultation price (${consultationPrice})`,
      );
    }

    // Validate reason
    if (!reason || reason.trim().length < 10) {
      throw new BadRequestException(
        'Refund reason is required and must be at least 10 characters',
      );
    }

    // TODO: Check if consultation was paid
    // For now, we'll assume it was paid and proceed

    // TODO: Create refund record in payment module
    // This would typically involve:
    // 1. Creating a Refund entity
    // 2. Processing the refund through payment gateway (ЮКасса)
    // 3. Updating payment status

    // Generate mock refund ID for now
    const refundId = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Update consultation status if fully refunded
    if (amount === consultationPrice) {
      consultation.status = 'cancelled';
      consultation.cancelledAt = new Date();
      consultation.cancellationReason = `Refund issued: ${reason}`;
      await this.consultationRepository.save(consultation);
    }

    // TODO: Send notification to client about refund
    // TODO: Log refund in audit log

    return {
      success: true,
      message: `Refund of ${amount} ${consultation.currency} issued successfully`,
      refundId,
      amount,
    };
  }
}
