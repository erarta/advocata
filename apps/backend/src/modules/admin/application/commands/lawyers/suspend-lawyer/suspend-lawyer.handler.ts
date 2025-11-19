import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuspendLawyerCommand } from './suspend-lawyer.command';
import { LawyerOrmEntity } from '../../../../../lawyer/infrastructure/persistence/lawyer.orm-entity';
import { LawyerStatus } from '../../../../../lawyer/domain/enums/lawyer-status.enum';

interface SuspendLawyerResult {
  success: boolean;
  message: string;
  lawyer: LawyerOrmEntity;
}

@CommandHandler(SuspendLawyerCommand)
export class SuspendLawyerHandler
  implements ICommandHandler<SuspendLawyerCommand>
{
  constructor(
    @InjectRepository(LawyerOrmEntity)
    private readonly lawyerRepository: Repository<LawyerOrmEntity>,
  ) {}

  async execute(command: SuspendLawyerCommand): Promise<SuspendLawyerResult> {
    const { lawyerId, dto } = command;
    const { reason, durationDays, notes } = dto;

    // Find lawyer
    const lawyer = await this.lawyerRepository.findOne({
      where: { id: lawyerId },
    });

    if (!lawyer) {
      throw new NotFoundException(`Lawyer with ID ${lawyerId} not found`);
    }

    // Check if lawyer can be suspended
    if (
      lawyer.status !== LawyerStatus.Active &&
      lawyer.status !== LawyerStatus.Inactive
    ) {
      throw new ConflictException(
        `Cannot suspend lawyer with status: ${lawyer.status}`,
      );
    }

    if (lawyer.status === LawyerStatus.Suspended) {
      throw new ConflictException('Lawyer is already suspended');
    }

    // Validate reason
    if (!reason || reason.trim().length < 10) {
      throw new BadRequestException(
        'Suspension reason is required and must be at least 10 characters',
      );
    }

    // Update lawyer status
    lawyer.status = LawyerStatus.Suspended;
    lawyer.isAvailable = false;

    // Build suspension notes
    let suspensionNotes = `Suspended: ${reason.trim()}`;
    if (notes) {
      suspensionNotes += `\nNotes: ${notes}`;
    }

    // Add suspension duration if provided
    if (durationDays && durationDays > 0) {
      const suspensionUntil = new Date();
      suspensionUntil.setDate(suspensionUntil.getDate() + durationDays);
      suspensionNotes += `\nSuspended until: ${suspensionUntil.toISOString()}`;
      // Note: We don't have a suspensionUntil field in the ORM entity,
      // so we're storing it in the notes for now
    }

    lawyer.verificationNotes = suspensionNotes;

    await this.lawyerRepository.save(lawyer);

    // TODO: Cancel upcoming consultations
    // const upcomingConsultations = await this.consultationRepository.find({
    //   where: {
    //     lawyerId,
    //     status: In(['scheduled', 'confirmed']),
    //     scheduledStart: MoreThan(new Date()),
    //   },
    // });
    //
    // for (const consultation of upcomingConsultations) {
    //   await this.consultationService.cancel(
    //     consultation.id,
    //     'Lawyer account suspended',
    //   );
    //   // Process refunds
    //   await this.paymentService.refund(consultation.paymentId);
    // }

    // TODO: Log suspension for audit
    // await this.auditLogger.log({
    //   userId: 'admin-id',
    //   action: 'SUSPEND_LAWYER',
    //   entityType: 'lawyer',
    //   entityId: lawyerId,
    //   reason,
    //   durationDays,
    // });

    // TODO: Send suspension notification
    // await this.notificationService.sendLawyerSuspendedNotification(
    //   lawyer.userId,
    //   reason,
    //   durationDays,
    // );

    return {
      success: true,
      message: `Lawyer suspended successfully${durationDays ? ` for ${durationDays} days` : ''}`,
      lawyer,
    };
  }
}
