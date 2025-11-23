import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BanUserCommand } from './ban-user.command';
import { UserOrmEntity } from '../../../../../identity/infrastructure/persistence/user.orm-entity';
import { UserStatus } from '../../../../../identity/domain/enums/user-status.enum';

interface BanUserResult {
  success: boolean;
  message: string;
}

@CommandHandler(BanUserCommand)
export class BanUserHandler implements ICommandHandler<BanUserCommand> {
  private readonly logger = new Logger(BanUserHandler.name);

  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
  ) {}

  async execute(command: BanUserCommand): Promise<BanUserResult> {
    const { userId, dto } = command;
    const { reason, notes } = dto;

    // Find user
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Validate current status
    if (user.status === UserStatus.Banned) {
      throw new BadRequestException('User is already banned');
    }

    if (user.status === UserStatus.Deleted) {
      throw new BadRequestException('Cannot ban a deleted user');
    }

    // Update user status to banned
    user.status = UserStatus.Banned;
    await this.userRepository.save(user);

    // Log ban action
    this.logger.warn(
      `User ${userId} permanently banned. Reason: ${reason}${
        notes ? `, Notes: ${notes}` : ''
      }`,
    );

    // TODO: Send notification to user about ban
    // await this.notificationService.sendBanNotification(user, { reason });

    // TODO: Cancel all active subscriptions
    // await this.subscriptionService.cancelUserSubscriptions(userId, 'User banned');

    // TODO: Cancel all upcoming consultations
    // await this.consultationService.cancelUserConsultations(
    //   userId,
    //   'User account banned',
    // );

    // TODO: Store ban details in audit log
    // await this.auditLogService.log({
    //   action: 'USER_BANNED',
    //   userId,
    //   details: { reason, notes },
    //   severity: 'HIGH',
    // });

    // TODO: Revoke all active sessions/tokens
    // await this.authService.revokeAllUserSessions(userId);

    return {
      success: true,
      message: 'User banned successfully',
    };
  }
}
