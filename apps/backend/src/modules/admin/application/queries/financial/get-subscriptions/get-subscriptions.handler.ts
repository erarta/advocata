import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetSubscriptionsQuery } from './get-subscriptions.query';
import { PaymentOrmEntity } from '../../../../../payment/infrastructure/persistence/payment.orm-entity';
import { UserOrmEntity } from '../../../../../identity/infrastructure/persistence/user.orm-entity';

interface PaginatedResponse {
  items: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@QueryHandler(GetSubscriptionsQuery)
export class GetSubscriptionsHandler implements IQueryHandler<GetSubscriptionsQuery> {
  constructor(
    @InjectRepository(PaymentOrmEntity)
    private readonly paymentRepository: Repository<PaymentOrmEntity>,
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
  ) {}

  async execute(query: GetSubscriptionsQuery): Promise<PaginatedResponse> {
    const {
      status,
      tier,
      userId,
      page = 1,
      limit = 20,
    } = query.dto;

    // TODO: Implement when subscription table exists
    // For now, we can get subscription payments from the payment table

    const queryBuilder = this.paymentRepository.createQueryBuilder('payment');

    // Filter only subscription payments
    queryBuilder.where('payment.subscriptionId IS NOT NULL');

    // Filter by user ID
    if (userId) {
      queryBuilder.andWhere('payment.userId = :userId', { userId });
    }

    // Filter by status
    if (status) {
      // Map subscription status to payment status
      const paymentStatus = status === 'active' ? 'succeeded' : status;
      queryBuilder.andWhere('payment.status = :status', { status: paymentStatus });
    }

    // TODO: Filter by tier when subscription metadata includes tier information

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Order by most recent first
    queryBuilder.orderBy('payment.createdAt', 'DESC');

    // Execute query
    const [payments, total] = await queryBuilder.getManyAndCount();

    // Enrich with user data
    const items = await Promise.all(
      payments.map(async (payment) => {
        const user = await this.userRepository.findOne({ where: { id: payment.userId } });

        return {
          id: payment.subscriptionId,
          userId: payment.userId,
          user: user
            ? {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
              }
            : null,
          tier: payment.metadata?.tier || 'basic',
          status: payment.status === 'succeeded' ? 'active' : payment.status,
          amount: payment.amount,
          currency: payment.currency,
          startDate: payment.completedAt || payment.createdAt,
          renewalDate: payment.metadata?.renewalDate,
          createdAt: payment.createdAt,
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
