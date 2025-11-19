import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetPayoutsQuery } from './get-payouts.query';
import { PaymentOrmEntity } from '../../../../../payment/infrastructure/persistence/payment.orm-entity';
import { ConsultationOrmEntity } from '../../../../../consultation/infrastructure/persistence/consultation.orm-entity';
import { LawyerOrmEntity } from '../../../../../lawyer/infrastructure/persistence/lawyer.orm-entity';

interface PaginatedResponse {
  items: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@QueryHandler(GetPayoutsQuery)
export class GetPayoutsHandler implements IQueryHandler<GetPayoutsQuery> {
  // Platform commission (10% - same as in Payment entity)
  private static readonly PLATFORM_COMMISSION = 0.10;

  constructor(
    @InjectRepository(PaymentOrmEntity)
    private readonly paymentRepository: Repository<PaymentOrmEntity>,
    @InjectRepository(ConsultationOrmEntity)
    private readonly consultationRepository: Repository<ConsultationOrmEntity>,
    @InjectRepository(LawyerOrmEntity)
    private readonly lawyerRepository: Repository<LawyerOrmEntity>,
  ) {}

  async execute(query: GetPayoutsQuery): Promise<PaginatedResponse> {
    const {
      status = 'pending',
      lawyerId,
      minAmount = 0,
      page = 1,
      limit = 20,
    } = query.dto;

    // Get all lawyers or specific lawyer
    const lawyerQuery = this.lawyerRepository.createQueryBuilder('lawyer');

    if (lawyerId) {
      lawyerQuery.where('lawyer.id = :lawyerId', { lawyerId });
    }

    const lawyers = await lawyerQuery.getMany();

    // Calculate pending payouts for each lawyer
    const payoutsPromises = lawyers.map(async (lawyer) => {
      // Get all completed consultations for this lawyer
      const consultations = await this.consultationRepository.find({
        where: { lawyerId: lawyer.id },
      });

      // Get payments for these consultations (status = 'succeeded')
      const consultationIds = consultations.map((c) => c.id);

      if (consultationIds.length === 0) {
        return null;
      }

      const payments = await this.paymentRepository
        .createQueryBuilder('payment')
        .where('payment.consultationId IN (:...ids)', { ids: consultationIds })
        .andWhere('payment.status = :status', { status: 'succeeded' })
        .getMany();

      // Calculate total earnings
      const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
      const platformCommission = totalRevenue * GetPayoutsHandler.PLATFORM_COMMISSION;
      const lawyerEarnings = totalRevenue - platformCommission;

      // TODO: Subtract already paid amount from actual payout records
      const alreadyPaid = 0; // Will be implemented when payout table exists
      const pendingAmount = lawyerEarnings - alreadyPaid;

      // Filter by minimum amount
      if (pendingAmount < minAmount) {
        return null;
      }

      // TODO: Filter by actual payout status when payout table exists
      // For now, we calculate "pending" payouts based on unpaid earnings

      return {
        lawyerId: lawyer.id,
        lawyer: {
          id: lawyer.id,
          firstName: lawyer.firstName,
          lastName: lawyer.lastName,
          email: lawyer.email,
        },
        totalEarnings: lawyerEarnings,
        alreadyPaid,
        pendingAmount,
        consultationCount: payments.length,
        status: pendingAmount > 0 ? 'pending' : 'completed',
        calculatedAt: new Date(),
      };
    });

    let payouts = (await Promise.all(payoutsPromises)).filter((p) => p !== null);

    // Filter by status (only 'pending' for now since we don't have payout table)
    if (status !== 'pending') {
      payouts = [];
    }

    // Apply pagination
    const total = payouts.length;
    const skip = (page - 1) * limit;
    const paginatedPayouts = payouts.slice(skip, skip + limit);

    return {
      items: paginatedPayouts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
