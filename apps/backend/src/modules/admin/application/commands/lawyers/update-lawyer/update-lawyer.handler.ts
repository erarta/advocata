import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateLawyerCommand } from './update-lawyer.command';
import { LawyerOrmEntity } from '../../../../../lawyer/infrastructure/persistence/lawyer.orm-entity';

interface UpdateLawyerResult {
  success: boolean;
  message: string;
  lawyer: LawyerOrmEntity;
}

@CommandHandler(UpdateLawyerCommand)
export class UpdateLawyerHandler
  implements ICommandHandler<UpdateLawyerCommand>
{
  constructor(
    @InjectRepository(LawyerOrmEntity)
    private readonly lawyerRepository: Repository<LawyerOrmEntity>,
  ) {}

  async execute(command: UpdateLawyerCommand): Promise<UpdateLawyerResult> {
    const { lawyerId, dto } = command;

    // Find lawyer
    const lawyer = await this.lawyerRepository.findOne({
      where: { id: lawyerId },
    });

    if (!lawyer) {
      throw new NotFoundException(`Lawyer with ID ${lawyerId} not found`);
    }

    // Update education if provided
    if (dto.education !== undefined) {
      if (dto.education.trim().length === 0) {
        throw new BadRequestException('Education cannot be empty');
      }
      if (dto.education.length > 500) {
        throw new BadRequestException(
          'Education is too long (max 500 characters)',
        );
      }
      lawyer.education = dto.education.trim();
    }

    // Update bio if provided
    if (dto.bio !== undefined) {
      if (dto.bio.trim().length === 0) {
        throw new BadRequestException('Bio cannot be empty');
      }
      if (dto.bio.length < 50) {
        throw new BadRequestException(
          'Bio is too short (minimum 50 characters)',
        );
      }
      if (dto.bio.length > 1000) {
        throw new BadRequestException(
          'Bio is too long (maximum 1000 characters)',
        );
      }
      lawyer.bio = dto.bio.trim();
    }

    // Update hourly rate if provided
    if (dto.hourlyRate !== undefined) {
      if (dto.hourlyRate < 500 || dto.hourlyRate > 50000) {
        throw new BadRequestException(
          'Hourly rate must be between 500 and 50,000 RUB',
        );
      }
      lawyer.hourlyRate = dto.hourlyRate;
    }

    // Update experience years if provided
    if (dto.experienceYears !== undefined) {
      if (dto.experienceYears < 0 || dto.experienceYears > 50) {
        throw new BadRequestException(
          'Experience years must be between 0 and 50',
        );
      }
      lawyer.experienceYears = dto.experienceYears;
    }

    // Update specializations if provided
    if (dto.specializations !== undefined && dto.specializations.length > 0) {
      if (dto.specializations.length > 5) {
        throw new BadRequestException('Maximum 5 specializations allowed');
      }
      lawyer.specializations = dto.specializations;
    }

    // Update availability if provided
    if (dto.isAvailable !== undefined) {
      lawyer.isAvailable = dto.isAvailable;
    }

    // Save updated lawyer
    const updatedLawyer = await this.lawyerRepository.save(lawyer);

    // TODO: Log changes for audit trail
    // await this.auditLogger.log({
    //   userId: 'admin-id', // From request context
    //   action: 'UPDATE_LAWYER',
    //   entityType: 'lawyer',
    //   entityId: lawyerId,
    //   changes: dto,
    // });

    // TODO: Send notification if major changes
    // if (dto.hourlyRate || dto.specializations) {
    //   await this.notificationService.sendProfileUpdatedNotification(lawyer.userId);
    // }

    return {
      success: true,
      message: 'Lawyer profile updated successfully',
      lawyer: updatedLawyer,
    };
  }
}
