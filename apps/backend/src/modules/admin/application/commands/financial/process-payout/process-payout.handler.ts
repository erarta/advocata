import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcessPayoutCommand } from './process-payout.command';
import { LawyerOrmEntity } from '../../../../../lawyer/infrastructure/persistence/lawyer.orm-entity';
import { PaymentOrmEntity } from '../../../../../payment/infrastructure/persistence/payment.orm-entity';
import { ConsultationOrmEntity } from '../../../../../consultation/infrastructure/persistence/consultation.orm-entity';

interface ProcessPayoutResult {
  success: boolean;
  payoutId: string;
  amount: number;
  message: string;
}

@CommandHandler(ProcessPayoutCommand)
export class ProcessPayoutHandler implements ICommandHandler<ProcessPayoutCommand> {
  private static readonly PLATFORM_COMMISSION = 0.10;

  constructor(
    @InjectRepository(LawyerOrmEntity)
    private readonly lawyerRepository: Repository<LawyerOrmEntity>,
    @InjectRepository(PaymentOrmEntity)
    private readonly paymentRepository: Repository<PaymentOrmEntity>,
    @InjectRepository(ConsultationOrmEntity)
    private readonly consultationRepository: Repository<ConsultationOrmEntity>,
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

    // TODO: Subtract already paid amount from payout records
    const alreadyPaid = 0;
    const pendingAmount = lawyerEarnings - alreadyPaid;

    // 3. Validate amount
    if (pendingAmount <= 0) {
      throw new BadRequestException('No pending earnings to payout');
    }

    // TODO: Validate maximum payout amount (e.g., not more than pending)

    // 4. Process payout
    // TODO: Integrate with payment gateway (ЮКасса) for actual payout
    // TODO: Create payout record in database
    // TODO: Update lawyer's earnings_paid field
    // TODO: Send notification to lawyer

    const payoutId = `payout_${Date.now()}_${lawyerId}`;

    // For now, log the payout (will be replaced with actual processing)
    console.log(`[PAYOUT] Processing payout for lawyer ${lawyerId}`, {
      payoutId,
      amount: pendingAmount,
      method: dto.method,
      notes: dto.notes,
    });

    return {
      success: true,
      payoutId,
      amount: pendingAmount,
      message: `Payout of ${pendingAmount} RUB processed successfully via ${dto.method}`,
    };
  }
}
