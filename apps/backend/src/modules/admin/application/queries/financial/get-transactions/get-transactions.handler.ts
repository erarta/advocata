import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetTransactionsQuery } from './get-transactions.query';
import { PaymentOrmEntity } from '../../../../../payment/infrastructure/persistence/payment.orm-entity';
import { UserOrmEntity } from '../../../../../identity/infrastructure/persistence/user.orm-entity';
import { ConsultationOrmEntity } from '../../../../../consultation/infrastructure/persistence/consultation.orm-entity';

interface PaginatedResponse {
  items: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@QueryHandler(GetTransactionsQuery)
export class GetTransactionsHandler implements IQueryHandler<GetTransactionsQuery> {
  constructor(
    @InjectRepository(PaymentOrmEntity)
    private readonly paymentRepository: Repository<PaymentOrmEntity>,
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
    @InjectRepository(ConsultationOrmEntity)
    private readonly consultationRepository: Repository<ConsultationOrmEntity>,
  ) {}

  async execute(query: GetTransactionsQuery): Promise<PaginatedResponse> {
    const {
      type,
      status,
      userId,
      lawyerId,
      dateFrom,
      dateTo,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query.dto;

    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.userId', 'user')
      .leftJoinAndSelect('payment.consultationId', 'consultation');

    // Filter by type (using metadata or consultationId/subscriptionId)
    if (type) {
      switch (type) {
        case 'payment':
          queryBuilder.andWhere('payment.consultationId IS NOT NULL');
          break;
        case 'subscription':
          queryBuilder.andWhere('payment.subscriptionId IS NOT NULL');
          break;
        // TODO: Add payout, refund, commission filtering when those tables exist
      }
    }

    // Filter by status
    if (status) {
      queryBuilder.andWhere('payment.status = :status', { status });
    }

    // Filter by user ID
    if (userId) {
      queryBuilder.andWhere('payment.userId = :userId', { userId });
    }

    // Filter by lawyer ID (through consultation)
    if (lawyerId) {
      queryBuilder.andWhere('consultation.lawyerId = :lawyerId', { lawyerId });
    }

    // Filter by date range
    if (dateFrom) {
      queryBuilder.andWhere('payment.createdAt >= :dateFrom', { dateFrom: new Date(dateFrom) });
    }

    if (dateTo) {
      queryBuilder.andWhere('payment.createdAt <= :dateTo', { dateTo: new Date(dateTo) });
    }

    // Apply sorting
    const sortField = sortBy === 'amount' ? 'payment.amount' : 'payment.createdAt';
    queryBuilder.orderBy(sortField, sortOrder.toUpperCase() as 'ASC' | 'DESC');

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Execute query
    const [payments, total] = await queryBuilder.getManyAndCount();

    // Enrich with user and consultation data
    const items = await Promise.all(
      payments.map(async (payment) => {
        const user = await this.userRepository.findOne({ where: { id: payment.userId } });
        const consultation = payment.consultationId
          ? await this.consultationRepository.findOne({
              where: { id: payment.consultationId },
            })
          : null;

        return {
          id: payment.id,
          type: payment.subscriptionId ? 'subscription' : 'payment',
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          method: payment.method,
          description: payment.description,
          user: user
            ? {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
              }
            : null,
          consultation: consultation
            ? {
                id: consultation.id,
                type: consultation.type,
                lawyerId: consultation.lawyerId,
              }
            : null,
          createdAt: payment.createdAt,
          completedAt: payment.completedAt,
          refundedAmount: payment.refundedAmount,
        };
      }),
    );

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
