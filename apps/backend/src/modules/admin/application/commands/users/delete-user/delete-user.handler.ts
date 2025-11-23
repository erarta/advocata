import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeleteUserCommand } from './delete-user.command';
import { UserOrmEntity } from '../../../../../identity/infrastructure/persistence/user.orm-entity';
import { UserStatus } from '../../../../../identity/domain/enums/user-status.enum';

interface DeleteUserResult {
  success: boolean;
  message: string;
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  private readonly logger = new Logger(DeleteUserHandler.name);

  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
  ) {}

  async execute(command: DeleteUserCommand): Promise<DeleteUserResult> {
    const { userId } = command;

    // Find user
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Validate current status
    if (user.status === UserStatus.Deleted) {
      throw new BadRequestException('User is already deleted');
    }

    // Soft delete: Mark as deleted but keep data for legal/compliance reasons
    user.status = UserStatus.Deleted;

    // Anonymize personal data (GDPR compliance)
    // Keep minimal data for financial/legal records
    const anonymizedEmail = user.email
      ? `deleted_${user.id}@anonymized.com`
      : null;
    const anonymizedPhone = `deleted_${user.id.substring(0, 8)}`;

    user.email = anonymizedEmail;
    user.phoneNumber = anonymizedPhone;
    user.firstName = 'Deleted';
    user.lastName = 'User';

    await this.userRepository.save(user);

    // Log deletion
    this.logger.warn(`User ${userId} soft deleted and anonymized`);

    // TODO: Cancel active subscriptions
    // await this.subscriptionService.cancelUserSubscriptions(
    //   userId,
    //   'User account deleted',
    // );

    // TODO: Cancel upcoming consultations
    // await this.consultationService.cancelUserConsultations(
    //   userId,
    //   'User account deleted',
    // );

    // TODO: Keep financial records for legal compliance (do NOT delete)
    // Financial records must be retained per 152-ФЗ and other regulations

    // TODO: Revoke all active sessions/tokens
    // await this.authService.revokeAllUserSessions(userId);

    // TODO: Store deletion details in audit log
    // await this.auditLogService.log({
    //   action: 'USER_DELETED',
    //   userId,
    //   details: { deletedAt: new Date() },
    //   severity: 'HIGH',
    // });

    // TODO: Schedule hard delete after retention period (e.g., 3 years)
    // await this.schedulerService.scheduleHardDelete(userId, {
    //   deleteAfterDays: 1095, // 3 years
    // });

    return {
      success: true,
      message: 'User deleted successfully (soft delete with anonymization)',
    };
  }
}
