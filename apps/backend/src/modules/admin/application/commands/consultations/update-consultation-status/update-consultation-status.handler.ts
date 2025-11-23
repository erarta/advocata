import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UpdateConsultationStatusCommand } from './update-consultation-status.command';
import { ConsultationOrmEntity } from '../../../../../consultation/infrastructure/persistence/consultation.orm-entity';

interface UpdateConsultationStatusResult {
  success: boolean;
  message: string;
  consultation: ConsultationOrmEntity;
}

@CommandHandler(UpdateConsultationStatusCommand)
export class UpdateConsultationStatusHandler
  implements ICommandHandler<UpdateConsultationStatusCommand>
{
  constructor(
    @InjectRepository(ConsultationOrmEntity)
    private readonly consultationRepository: Repository<ConsultationOrmEntity>,
  ) {}

  async execute(
    command: UpdateConsultationStatusCommand,
  ): Promise<UpdateConsultationStatusResult> {
    const { consultationId, dto } = command;
    const { status, reason, notes } = dto;

    // Find consultation
    const consultation = await this.consultationRepository.findOne({
      where: { id: consultationId },
    });

    if (!consultation) {
      throw new NotFoundException(
        `Consultation with ID ${consultationId} not found`,
      );
    }

    // Validate status transition
    this.validateStatusTransition(consultation.status, status);

    // Require reason for cancellation
    if (status === 'cancelled' && !reason) {
      throw new BadRequestException(
        'Cancellation reason is required when cancelling a consultation',
      );
    }

    // Update consultation status
    const oldStatus = consultation.status;
    consultation.status = status;

    // Update timestamps based on status
    const now = new Date();
    switch (status) {
      case 'in_progress':
        if (!consultation.startedAt) {
          consultation.startedAt = now;
        }
        break;
      case 'completed':
        if (!consultation.completedAt) {
          consultation.completedAt = now;
        }
        break;
      case 'cancelled':
        if (!consultation.cancelledAt) {
          consultation.cancelledAt = now;
        }
        if (reason) {
          consultation.cancellationReason = reason;
        }
        // TODO: Process refund if payment was made
        break;
    }

    // Save updated consultation
    const updatedConsultation =
      await this.consultationRepository.save(consultation);

    // TODO: Send notifications to client and lawyer
    // TODO: Log status change in audit log

    return {
      success: true,
      message: `Consultation status updated from ${oldStatus} to ${status}`,
      consultation: updatedConsultation,
    };
  }

  private validateStatusTransition(
    currentStatus: string,
    newStatus: string,
  ): void {
    const validTransitions: Record<string, string[]> = {
      scheduled: ['in_progress', 'cancelled'],
      in_progress: ['completed', 'cancelled'],
      completed: ['disputed', 'cancelled'],
      cancelled: [], // Cannot transition from cancelled
      disputed: ['completed', 'cancelled'], // Can resolve dispute
    };

    const allowedStatuses = validTransitions[currentStatus] || [];

    // Allow admin to override some transitions
    // But prevent transitioning from cancelled (unless it's to the same status)
    if (currentStatus === 'cancelled' && newStatus !== 'cancelled') {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}. Cancelled consultations cannot be reactivated.`,
      );
    }

    if (!allowedStatuses.includes(newStatus) && currentStatus !== newStatus) {
      // Allow admin override for certain cases
      const adminOverrideAllowed = [
        'scheduled',
        'in_progress',
        'completed',
        'cancelled',
      ];
      if (!adminOverrideAllowed.includes(newStatus)) {
        throw new BadRequestException(
          `Invalid status transition from ${currentStatus} to ${newStatus}`,
        );
      }
    }
  }
}
