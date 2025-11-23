import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BanLawyerCommand } from './ban-lawyer.command';
import { LawyerOrmEntity } from '../../../../../lawyer/infrastructure/persistence/lawyer.orm-entity';
import { LawyerStatus } from '../../../../../lawyer/domain/enums/lawyer-status.enum';

interface BanLawyerResult {
  success: boolean;
  message: string;
  lawyer: LawyerOrmEntity;
}

@CommandHandler(BanLawyerCommand)
export class BanLawyerHandler implements ICommandHandler<BanLawyerCommand> {
  constructor(
    @InjectRepository(LawyerOrmEntity)
    private readonly lawyerRepository: Repository<LawyerOrmEntity>,
  ) {}

  async execute(command: BanLawyerCommand): Promise<BanLawyerResult> {
    const { lawyerId, dto } = command;
    const { reason, notes } = dto;

    // Find lawyer
    const lawyer = await this.lawyerRepository.findOne({
      where: { id: lawyerId },
    });

    if (!lawyer) {
      throw new NotFoundException(`Lawyer with ID ${lawyerId} not found`);
    }

    // Check if lawyer is already banned
    if (lawyer.status === LawyerStatus.Banned) {
      throw new ConflictException('Lawyer is already banned');
    }

    // Validate reason
    if (!reason || reason.trim().length < 10) {
      throw new BadRequestException(
        'Ban reason is required and must be at least 10 characters',
      );
    }

    // Update lawyer status
    lawyer.status = LawyerStatus.Banned;
    lawyer.isAvailable = false;

    // Build ban notes
    let banNotes = `Permanently Banned: ${reason.trim()}`;
    if (notes) {
      banNotes += `\nAdditional Notes: ${notes}`;
    }
    banNotes += `\nBanned at: ${new Date().toISOString()}`;

    lawyer.verificationNotes = banNotes;

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
    //     'Lawyer account permanently banned',
    //   );
    //   // Process refunds
    //   await this.paymentService.refund(consultation.paymentId);
    // }

    // TODO: Process pending payouts
    // const pendingPayouts = await this.paymentService.getPendingPayouts(lawyerId);
    // for (const payout of pendingPayouts) {
    //   await this.paymentService.processPayout(payout.id);
    // }

    // TODO: Log ban for audit
    // await this.auditLogger.log({
    //   userId: 'admin-id',
    //   action: 'BAN_LAWYER',
    //   entityType: 'lawyer',
    //   entityId: lawyerId,
    //   reason,
    //   notes,
    // });

    // TODO: Send ban notification
    // await this.notificationService.sendLawyerBannedNotification(
    //   lawyer.userId,
    //   reason,
    // );

    return {
      success: true,
      message: 'Lawyer banned permanently',
      lawyer,
    };
  }
}
