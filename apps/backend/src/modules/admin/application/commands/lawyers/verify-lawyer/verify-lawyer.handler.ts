import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VerifyLawyerCommand } from './verify-lawyer.command';
import { LawyerOrmEntity } from '../../../../../lawyer/infrastructure/persistence/lawyer.orm-entity';
import { UserOrmEntity } from '../../../../../identity/infrastructure/persistence/user.orm-entity';
import { LawyerStatus } from '../../../../../lawyer/domain/enums/lawyer-status.enum';
import { VerificationStatus } from '../../../../../lawyer/domain/enums/verification-status.enum';

interface VerifyLawyerResult {
  success: boolean;
  message: string;
  lawyer: LawyerOrmEntity;
}

@CommandHandler(VerifyLawyerCommand)
export class VerifyLawyerHandler
  implements ICommandHandler<VerifyLawyerCommand>
{
  constructor(
    @InjectRepository(LawyerOrmEntity)
    private readonly lawyerRepository: Repository<LawyerOrmEntity>,
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
  ) {}

  async execute(command: VerifyLawyerCommand): Promise<VerifyLawyerResult> {
    const { lawyerId, dto } = command;
    const { verified, notes, rejectionReason } = dto;

    // Find lawyer
    const lawyer = await this.lawyerRepository.findOne({
      where: { id: lawyerId },
    });

    if (!lawyer) {
      throw new NotFoundException(`Lawyer with ID ${lawyerId} not found`);
    }

    // Check if lawyer is in pending verification status
    if (
      lawyer.verificationStatus !== VerificationStatus.Pending &&
      lawyer.verificationStatus !== VerificationStatus.InReview &&
      lawyer.verificationStatus !== VerificationStatus.DocumentsRequested
    ) {
      throw new ConflictException(
        `Lawyer is not pending verification (current status: ${lawyer.verificationStatus})`,
      );
    }

    if (verified) {
      // APPROVE VERIFICATION
      // Validate hourly rate is provided (we'll use a default if not provided via DTO)
      // In a real scenario, hourly rate might come from the lawyer's profile or be set here
      const hourlyRate = lawyer.hourlyRate || 3000; // Default to 3000 RUB if not set

      if (hourlyRate < 500 || hourlyRate > 50000) {
        throw new BadRequestException(
          'Hourly rate must be between 500 and 50,000 RUB',
        );
      }

      // Update lawyer status
      lawyer.verificationStatus = VerificationStatus.Approved;
      lawyer.status = LawyerStatus.Active;
      lawyer.verificationNotes = notes || 'Verified and approved';
      lawyer.hourlyRate = hourlyRate;
      lawyer.isAvailable = true;

      await this.lawyerRepository.save(lawyer);

      // TODO: Send approval notification to lawyer
      // await this.notificationService.sendLawyerApprovedNotification(lawyer.userId);

      // TODO: Create user account if not exists and link to lawyer
      // This might already be done during registration, but double-check
      const user = await this.userRepository.findOne({
        where: { id: lawyer.userId },
      });

      if (!user) {
        // TODO: Create user account or link existing account
        console.warn(
          `User account not found for lawyer ${lawyerId}. Manual intervention may be required.`,
        );
      }

      return {
        success: true,
        message: 'Lawyer verified and approved successfully',
        lawyer,
      };
    } else {
      // REJECT VERIFICATION
      // Validate rejection reason is provided
      if (!rejectionReason || rejectionReason.trim().length < 10) {
        throw new BadRequestException(
          'Rejection reason is required and must be at least 10 characters',
        );
      }

      // Update lawyer status
      lawyer.verificationStatus = VerificationStatus.Rejected;
      lawyer.status = LawyerStatus.Inactive;
      lawyer.verificationNotes = rejectionReason.trim();
      lawyer.isAvailable = false;

      await this.lawyerRepository.save(lawyer);

      // TODO: Send rejection notification to lawyer with reason
      // await this.notificationService.sendLawyerRejectedNotification(
      //   lawyer.userId,
      //   rejectionReason,
      // );

      return {
        success: true,
        message: 'Lawyer verification rejected',
        lawyer,
      };
    }
  }
}
