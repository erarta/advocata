import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ApproveLawyerCommand } from './approve-lawyer.command';
import { Result } from '@shared/domain/result';
import { ILawyerRepository } from '../../../domain/repositories/lawyer.repository.interface';

/**
 * ApproveLawyerCommandHandler
 *
 * Handles lawyer verification approval
 */
@CommandHandler(ApproveLawyerCommand)
export class ApproveLawyerCommandHandler
  implements ICommandHandler<ApproveLawyerCommand, Result<void>>
{
  constructor(
    @Inject('ILawyerRepository')
    private readonly lawyerRepository: ILawyerRepository,
  ) {}

  async execute(command: ApproveLawyerCommand): Promise<Result<void>> {
    // 1. Find lawyer
    const lawyer = await this.lawyerRepository.findById(command.lawyerId);
    if (!lawyer) {
      return Result.fail('Lawyer not found');
    }

    // 2. Approve lawyer (domain logic)
    const approvalResult = lawyer.approve(command.notes);
    if (approvalResult.isFailure) {
      return Result.fail(approvalResult.error);
    }

    // 3. Save lawyer
    await this.lawyerRepository.save(lawyer);

    return Result.ok();
  }
}
