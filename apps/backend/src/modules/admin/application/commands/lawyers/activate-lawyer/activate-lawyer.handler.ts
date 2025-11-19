import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivateLawyerCommand } from './activate-lawyer.command';
import { LawyerOrmEntity } from '../../../../../lawyer/infrastructure/persistence/lawyer.orm-entity';
import { LawyerStatus } from '../../../../../lawyer/domain/enums/lawyer-status.enum';
import { VerificationStatus } from '../../../../../lawyer/domain/enums/verification-status.enum';

interface ActivateLawyerResult {
  success: boolean;
  message: string;
  lawyer: LawyerOrmEntity;
}

@CommandHandler(ActivateLawyerCommand)
export class ActivateLawyerHandler
  implements ICommandHandler<ActivateLawyerCommand>
{
  constructor(
    @InjectRepository(LawyerOrmEntity)
    private readonly lawyerRepository: Repository<LawyerOrmEntity>,
  ) {}

  async execute(command: ActivateLawyerCommand): Promise<ActivateLawyerResult> {
    const { lawyerId, dto } = command;
    const { notes } = dto;

    // Find lawyer
    const lawyer = await this.lawyerRepository.findOne({
      where: { id: lawyerId },
    });

    if (!lawyer) {
      throw new NotFoundException(`Lawyer with ID ${lawyerId} not found`);
    }

    // Check if lawyer can be activated
    if (
      lawyer.status !== LawyerStatus.Suspended &&
      lawyer.status !== LawyerStatus.Inactive
    ) {
      throw new ConflictException(
        `Cannot activate lawyer with status: ${lawyer.status}. Only suspended or inactive lawyers can be activated.`,
      );
    }

    // Check if lawyer is verified
    if (lawyer.verificationStatus !== VerificationStatus.Approved) {
      throw new BadRequestException(
        'Lawyer must be verified before activation. Please verify the lawyer first.',
      );
    }

    // Update lawyer status
    lawyer.status = LawyerStatus.Active;
    lawyer.isAvailable = true;

    // Update notes if provided
    if (notes) {
      const activationNote = `Activated: ${notes}\nActivated at: ${new Date().toISOString()}`;
      lawyer.verificationNotes = activationNote;
    } else {
      lawyer.verificationNotes = `Activated at: ${new Date().toISOString()}`;
    }

    await this.lawyerRepository.save(lawyer);

    // TODO: Log activation for audit
    // await this.auditLogger.log({
    //   userId: 'admin-id',
    //   action: 'ACTIVATE_LAWYER',
    //   entityType: 'lawyer',
    //   entityId: lawyerId,
    //   notes,
    // });

    // TODO: Send activation notification
    // await this.notificationService.sendLawyerActivatedNotification(
    //   lawyer.userId,
    // );

    return {
      success: true,
      message: 'Lawyer activated successfully',
      lawyer,
    };
  }
}
