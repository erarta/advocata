import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcessPayoutCommand } from './process-payout.command';
import { LawyerOrmEntity } from '../../../../../lawyer/infrastructure/persistence/lawyer.orm-entity';
import { PaymentOrmEntity } from '../../../../../payment/infrastructure/persistence/payment.orm-entity';
import { ConsultationOrmEntity } from '../../../../../consultation/infrastructure/persistence/consultation.orm-entity';
import { PayoutRepository } from '../../../../infrastructure/persistence/payout.repository';
import { PayoutOrmEntity, PayoutStatus } from '../../../../infrastructure/persistence/payout.orm-entity';
import { AuditLogService } from '../../../services/audit-log.service';

interface ProcessPayoutResult {
  success: boolean;
  payoutId: string;
  amount: number;
  message: string;
}

@CommandHandler(ProcessPayoutCommand)
export class ProcessPayoutHandler implements ICommandHandler<ProcessPayoutCommand> {
  private static readonly PLATFORM_COMMISSION = 0.10;
  private readonly logger = new Logger(ProcessPayoutHandler.name);

  constructor(
    @InjectRepository(LawyerOrmEntity)
    private readonly lawyerRepository: Repository<LawyerOrmEntity>,
    @InjectRepository(PaymentOrmEntity)
    private readonly paymentRepository: Repository<PaymentOrmEntity>,
    @InjectRepository(ConsultationOrmEntity)
    private readonly consultationRepository: Repository<ConsultationOrmEntity>,
    private readonly payoutRepository: PayoutRepository,
    private readonly auditLogService: AuditLogService,
  ) {}

  async execute(command: ProcessPayoutCommand): Promise<ProcessPayoutResult> {
    const { lawyerId, dto } = command;

    // 1. Validate lawyer exists and is active
    const lawyer = await this.lawyerRepository.findOne({
      where: { id: lawyerId },
    });

    if (!lawyer) {
      throw new NotFoundException(`Lawyer with ID ${lawyerId} not found`);
    }

    if (lawyer.status !== 'active') {
      throw new BadRequestException('Cannot process payout for inactive lawyer');
    }

    // 2. Calculate pending earnings
    const consultations = await this.consultationRepository.find({
      where: { lawyerId },
    });

    const consultationIds = consultations.map((c) => c.id);

    if (consultationIds.length === 0) {
      throw new BadRequestException('Lawyer has no consultations');
    }

    // Get all succeeded payments for lawyer's consultations
    const payments = await this.paymentRepository
      .createQueryBuilder('payment')
      .where('payment.consultationId IN (:...ids)', { ids: consultationIds })
      .andWhere('payment.status = :status', { status: 'succeeded' })
      .getMany();

    if (payments.length === 0) {
      throw new BadRequestException('Lawyer has no completed payments');
    }

    // Calculate total earnings
    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const platformCommission = totalRevenue * ProcessPayoutHandler.PLATFORM_COMMISSION;
    const lawyerEarnings = totalRevenue - platformCommission;

    // Subtract already paid amount from payout records
    const alreadyPaid = await this.payoutRepository.getTotalPaidToLawyer(lawyerId);
    const pendingAmount = lawyerEarnings - alreadyPaid;

    // 3. Validate amount
    if (pendingAmount <= 0) {
      throw new BadRequestException('No pending earnings to payout');
    }

    if (dto.amount && dto.amount > pendingAmount) {
      throw new BadRequestException(`Cannot payout more than pending amount (${pendingAmount} RUB)`);
    }

    const payoutAmount = dto.amount || pendingAmount;

    // 4. Create payout record in database
    const payoutId = await this.payoutRepository.nextId();

    const payout = new PayoutOrmEntity();
    payout.id = payoutId;
    payout.lawyerId = lawyerId;
    payout.amount = payoutAmount;
    payout.currency = 'RUB';
    payout.status = PayoutStatus.PROCESSING;
    payout.method = dto.method as any;
    payout.notes = dto.notes;
    payout.processedBy = dto.adminUserId; // TODO: Get from request context
    payout.processedAt = new Date();
    payout.metadata = {
      totalRevenue,
      platformCommission,
      lawyerEarnings,
      alreadyPaid,
      pendingAmount,
    };

    await this.payoutRepository.save(payout);

    // Log audit trail
    await this.auditLogService.logPayoutProcessing(
      dto.adminUserId || 'system',
      payoutId,
      payoutAmount,
      lawyerId,
      dto.method,
    );

    this.logger.log(`Payout ${payoutId} created for lawyer ${lawyerId}: ${payoutAmount} RUB via ${dto.method}`);

    // TODO: Integrate with payment gateway (ЮКасса) for actual payout
    // TODO: Send notification to lawyer

    return {
      success: true,
      payoutId,
      amount: payoutAmount,
      message: `Payout of ${payoutAmount} RUB processed successfully via ${dto.method}`,
    };
  }
}
