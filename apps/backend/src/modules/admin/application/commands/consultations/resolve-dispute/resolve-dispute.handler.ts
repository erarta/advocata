import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ResolveDisputeCommand } from './resolve-dispute.command';
import { ConsultationOrmEntity } from '../../../../../consultation/infrastructure/persistence/consultation.orm-entity';
import { IssueRefundCommand } from '../issue-refund/issue-refund.command';

interface ResolveDisputeResult {
  success: boolean;
  message: string;
  resolution: string;
}

@CommandHandler(ResolveDisputeCommand)
export class ResolveDisputeHandler
  implements ICommandHandler<ResolveDisputeCommand>
{
  constructor(
    @InjectRepository(ConsultationOrmEntity)
    private readonly consultationRepository: Repository<ConsultationOrmEntity>,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: ResolveDisputeCommand): Promise<ResolveDisputeResult> {
    const { consultationId, dto } = command;
    const { resolution, notes, refundAmount } = dto;

    // Find consultation
    const consultation = await this.consultationRepository.findOne({
      where: { id: consultationId },
    });

    if (!consultation) {
      throw new NotFoundException(
        `Consultation with ID ${consultationId} not found`,
      );
    }

    // Validate that consultation has a dispute
    // TODO: Check actual dispute status once dispute fields are added to entity
    const hasDispute =
      consultation.status === 'disputed' ||
      consultation.cancellationReason !== null;

    if (!hasDispute) {
      throw new BadRequestException(
        'Consultation does not have an active dispute',
      );
    }

    // Validate refund amount for partial refund
    if (resolution === 'refund_partial') {
      if (!refundAmount || refundAmount <= 0) {
        throw new BadRequestException(
          'Refund amount is required for partial refund',
        );
      }
      if (refundAmount > Number(consultation.price)) {
        throw new BadRequestException(
          'Refund amount cannot exceed consultation price',
        );
      }
    }

    // Apply resolution
    let message = '';
    switch (resolution) {
      case 'refund_full':
        // Issue full refund
        await this.commandBus.execute(
          new IssueRefundCommand(consultationId, {
            amount: Number(consultation.price),
            reason: `Dispute resolved: Full refund. ${notes || ''}`,
          }),
        );
        consultation.status = 'cancelled';
        message = 'Full refund issued and dispute resolved';
        break;

      case 'refund_partial':
        // Issue partial refund
        if (!refundAmount) {
          throw new BadRequestException(
            'Refund amount required for partial refund',
          );
        }
        await this.commandBus.execute(
          new IssueRefundCommand(consultationId, {
            amount: refundAmount,
            reason: `Dispute resolved: Partial refund. ${notes || ''}`,
          }),
        );
        consultation.status = 'completed';
        message = `Partial refund of ${refundAmount} issued and dispute resolved`;
        break;

      case 'no_refund':
        // Close dispute without refund
        consultation.status = 'completed';
        consultation.cancellationReason = null; // Clear dispute marker
        message = 'Dispute resolved without refund';
        break;

      case 'lawyer_warning':
        // Issue warning to lawyer and close dispute
        // TODO: Create warning record for lawyer
        // TODO: Integrate with lawyer reputation/rating system
        consultation.status = 'completed';
        message = 'Dispute resolved with lawyer warning issued';
        break;

      default:
        throw new BadRequestException(`Invalid resolution type: ${resolution}`);
    }

    // Store resolution notes
    if (notes) {
      const existingReason = consultation.cancellationReason || '';
      consultation.cancellationReason = `${existingReason}\n\nResolution: ${notes}`.trim();
    }

    // TODO: Update dispute status to 'resolved' when dispute entity exists
    // TODO: Store resolution details in dispute table

    // Save updated consultation
    await this.consultationRepository.save(consultation);

    // TODO: Send notifications to both client and lawyer
    // TODO: Log dispute resolution in audit log

    return {
      success: true,
      message,
      resolution,
    };
  }
}
