import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { RegisterLawyerCommand } from './register-lawyer.command';
import { Result } from '@shared/domain/result';
import { Lawyer } from '../../../domain/entities';
import { LicenseNumber, Experience } from '../../../domain/value-objects';
import { ILawyerRepository } from '../../../domain/repositories/lawyer.repository.interface';

export type RegisterLawyerResult = Result<{ lawyerId: string }>;

/**
 * RegisterLawyerCommandHandler
 *
 * Handles lawyer registration business logic
 */
@CommandHandler(RegisterLawyerCommand)
export class RegisterLawyerCommandHandler
  implements ICommandHandler<RegisterLawyerCommand, RegisterLawyerResult>
{
  constructor(
    @Inject('ILawyerRepository')
    private readonly lawyerRepository: ILawyerRepository,
  ) {}

  async execute(command: RegisterLawyerCommand): Promise<RegisterLawyerResult> {
    // 1. Validate and create LicenseNumber value object
    const licenseNumberOrError = LicenseNumber.create(command.licenseNumber);
    if (licenseNumberOrError.isFailure) {
      return Result.fail(licenseNumberOrError.error);
    }
    const licenseNumber = licenseNumberOrError.value;

    // 2. Check if license number already exists
    const exists = await this.lawyerRepository.existsByLicenseNumber(
      licenseNumber.value,
    );
    if (exists) {
      return Result.fail('License number already registered');
    }

    // 3. Check if user already has lawyer profile
    const existingLawyer = await this.lawyerRepository.findByUserId(
      command.userId,
    );
    if (existingLawyer) {
      return Result.fail('User already has a lawyer profile');
    }

    // 4. Create Experience value object
    const experienceOrError = Experience.create(command.experienceYears);
    if (experienceOrError.isFailure) {
      return Result.fail(experienceOrError.error);
    }
    const experience = experienceOrError.value;

    // 5. Generate ID
    const lawyerId = await this.lawyerRepository.nextId();

    // 6. Create Lawyer entity
    const lawyerOrError = Lawyer.create(
      lawyerId,
      command.userId,
      licenseNumber,
      command.specializations,
      experience,
      command.bio,
      command.education,
      command.hourlyRate,
    );

    if (lawyerOrError.isFailure) {
      return Result.fail(lawyerOrError.error);
    }

    const lawyer = lawyerOrError.value;

    // 7. Save lawyer
    await this.lawyerRepository.save(lawyer);

    // 8. Return success result
    return Result.ok({ lawyerId: lawyer.id });
  }
}
