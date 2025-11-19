import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuspendUserCommand } from './suspend-user.command';
import { UserOrmEntity } from '../../../../../identity/infrastructure/persistence/user.orm-entity';
import { UserStatus } from '../../../../../identity/domain/enums/user-status.enum';

interface SuspendUserResult {
  success: boolean;
  message: string;
  suspendedUntil?: Date;
}

@CommandHandler(SuspendUserCommand)
export class SuspendUserHandler implements ICommandHandler<SuspendUserCommand> {
  private readonly logger = new Logger(SuspendUserHandler.name);

  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
  ) {}

  async execute(command: SuspendUserCommand): Promise<SuspendUserResult> {
    const { userId, dto } = command;
    const { reason, durationDays, notes } = dto;

    // Find user
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Validate current status
    if (user.status === UserStatus.Suspended) {
      throw new BadRequestException('User is already suspended');
    }

    if (user.status === UserStatus.Banned) {
      throw new BadRequestException('Cannot suspend a banned user');
    }

    if (user.status === UserStatus.Deleted) {
      throw new BadRequestException('Cannot suspend a deleted user');
    }

    // Calculate suspension end date if duration is provided
    let suspendedUntil: Date | undefined;
    if (durationDays) {
      suspendedUntil = new Date();
      suspendedUntil.setDate(suspendedUntil.getDate() + durationDays);
    }

    // Update user status
    user.status = UserStatus.Suspended;
    await this.userRepository.save(user);

    // Log suspension action
    this.logger.log(
      `User ${userId} suspended. Reason: ${reason}${
        durationDays ? `, Duration: ${durationDays} days` : ' (indefinite)'
      }${notes ? `, Notes: ${notes}` : ''}`,
    );

    // TODO: Send notification to user about suspension
    // await this.notificationService.sendSuspensionNotification(user, {
    //   reason,
    //   suspendedUntil,
    // });

    // TODO: Cancel active consultations
    // await this.consultationService.cancelUserConsultations(userId, 'User suspended');

    // TODO: Store suspension details in audit log
    // await this.auditLogService.log({
    //   action: 'USER_SUSPENDED',
    //   userId,
    //   details: { reason, durationDays, notes, suspendedUntil },
    // });

    return {
      success: true,
      message: `User suspended successfully${
        durationDays ? ` for ${durationDays} days` : ''
      }`,
      suspendedUntil,
    };
  }
}
