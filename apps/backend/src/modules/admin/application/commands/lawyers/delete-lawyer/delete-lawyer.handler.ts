import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeleteLawyerCommand } from './delete-lawyer.command';
import { LawyerOrmEntity } from '../../../../../lawyer/infrastructure/persistence/lawyer.orm-entity';
import { LawyerStatus } from '../../../../../lawyer/domain/enums/lawyer-status.enum';

interface DeleteLawyerResult {
  success: boolean;
  message: string;
}

@CommandHandler(DeleteLawyerCommand)
export class DeleteLawyerHandler
  implements ICommandHandler<DeleteLawyerCommand>
{
  constructor(
    @InjectRepository(LawyerOrmEntity)
    private readonly lawyerRepository: Repository<LawyerOrmEntity>,
  ) {}

  async execute(command: DeleteLawyerCommand): Promise<DeleteLawyerResult> {
    const { lawyerId } = command;

    // Find lawyer
    const lawyer = await this.lawyerRepository.findOne({
      where: { id: lawyerId },
    });

    if (!lawyer) {
      throw new NotFoundException(`Lawyer with ID ${lawyerId} not found`);
    }

    // Soft delete: Mark as deleted but keep record
    lawyer.status = LawyerStatus.Deleted;
    lawyer.isAvailable = false;

    // Anonymize personal data (GDPR compliance)
    // Note: We keep the record for financial/legal reasons but anonymize PII
    lawyer.bio = '[DELETED]';
    lawyer.education = '[DELETED]';
    lawyer.licenseNumber = `DELETED_${lawyerId.substring(0, 8)}`;
    lawyer.verificationNotes = `Account deleted at: ${new Date().toISOString()}`;

    await this.lawyerRepository.save(lawyer);

    // TODO: Cancel all upcoming consultations
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
    //     'Lawyer account deleted',
    //   );
    //   // Process refunds
    //   await this.paymentService.refund(consultation.paymentId);
    // }

    // TODO: Process pending payouts
    // const pendingPayouts = await this.paymentService.getPendingPayouts(lawyerId);
    // for (const payout of pendingPayouts) {
    //   await this.paymentService.processPayout(payout.id);
    // }

    // TODO: Anonymize related user account
    // const user = await this.userRepository.findOne({
    //   where: { id: lawyer.userId },
    // });
    // if (user) {
    //   user.firstName = 'Deleted';
    //   user.lastName = 'User';
    //   user.email = `deleted_${user.id}@deleted.advocata.ru`;
    //   user.phoneNumber = null;
    //   await this.userRepository.save(user);
    // }

    // TODO: Log deletion for audit (keep financial records)
    // await this.auditLogger.log({
    //   userId: 'admin-id',
    //   action: 'DELETE_LAWYER',
    //   entityType: 'lawyer',
    //   entityId: lawyerId,
    //   reason: 'GDPR/Account deletion request',
    // });

    // TODO: Send confirmation notification
    // await this.notificationService.sendAccountDeletedNotification(
    //   lawyer.userId,
    // );

    return {
      success: true,
      message: 'Lawyer account deleted successfully (soft delete)',
    };
  }
}
