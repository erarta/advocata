import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivateUserCommand } from './activate-user.command';
import { UserOrmEntity } from '../../../../../identity/infrastructure/persistence/user.orm-entity';
import { UserStatus } from '../../../../../identity/domain/enums/user-status.enum';

interface ActivateUserResult {
  success: boolean;
  message: string;
}

@CommandHandler(ActivateUserCommand)
export class ActivateUserHandler
  implements ICommandHandler<ActivateUserCommand>
{
  private readonly logger = new Logger(ActivateUserHandler.name);

  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
  ) {}

  async execute(command: ActivateUserCommand): Promise<ActivateUserResult> {
    const { userId, notes } = command;

    // Find user
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Validate current status - can only activate suspended or banned users
    if (user.status === UserStatus.Active) {
      throw new BadRequestException('User is already active');
    }

    if (user.status === UserStatus.Deleted) {
      throw new BadRequestException('Cannot activate a deleted user');
    }

    if (user.status === UserStatus.PendingVerification) {
      throw new BadRequestException(
        'Cannot activate a user pending verification. User must complete verification first.',
      );
    }

    // Check if phone is verified (required for activation)
    if (!user.isPhoneVerified) {
      throw new BadRequestException(
        'Phone must be verified before activating account',
      );
    }

    const previousStatus = user.status;

    // Update user status to active
    user.status = UserStatus.Active;
    await this.userRepository.save(user);

    // Log activation
    this.logger.log(
      `User ${userId} activated (was ${previousStatus})${
        notes ? `. Notes: ${notes}` : ''
      }`,
    );

    // TODO: Send notification to user about activation
    // await this.notificationService.sendActivationNotification(user);

    // TODO: Store activation details in audit log
    // await this.auditLogService.log({
    //   action: 'USER_ACTIVATED',
    //   userId,
    //   details: { previousStatus, notes },
    // });

    return {
      success: true,
      message: 'User activated successfully',
    };
  }
}
