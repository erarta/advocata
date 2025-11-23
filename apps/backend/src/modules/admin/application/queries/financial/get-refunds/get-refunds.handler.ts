import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetRefundsQuery } from './get-refunds.query';
import { PaymentOrmEntity } from '../../../../../payment/infrastructure/persistence/payment.orm-entity';
import { ConsultationOrmEntity } from '../../../../../consultation/infrastructure/persistence/consultation.orm-entity';
import { UserOrmEntity } from '../../../../../identity/infrastructure/persistence/user.orm-entity';

interface PaginatedResponse {
  items: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@QueryHandler(GetRefundsQuery)
export class GetRefundsHandler implements IQueryHandler<GetRefundsQuery> {
  constructor(
    @InjectRepository(PaymentOrmEntity)
    private readonly paymentRepository: Repository<PaymentOrmEntity>,
    @InjectRepository(ConsultationOrmEntity)
    private readonly consultationRepository: Repository<ConsultationOrmEntity>,
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
  ) {}

  async execute(query: GetRefundsQuery): Promise<PaginatedResponse> {
    const {
      status,
      clientId,
      consultationId,
      page = 1,
      limit = 20,
    } = query.dto;

    // Query payments with refunded status or refundedAmount > 0
    const queryBuilder = this.paymentRepository.createQueryBuilder('payment');

    // Filter refunded or partially refunded payments
    queryBuilder.where(
      '(payment.status = :refundedStatus OR payment.refundedAmount IS NOT NULL)',
      { refundedStatus: 'refunded' },
    );

    // Filter by client ID (userId)
    if (clientId) {
      queryBuilder.andWhere('payment.userId = :clientId', { clientId });
    }

    // Filter by consultation ID
    if (consultationId) {
      queryBuilder.andWhere('payment.consultationId = :consultationId', { consultationId });
    }

    // TODO: Filter by refund status when refund table exists
    // For now, we determine status based on payment status:
    // - 'refunded' status = 'processed'
    // - Has refundedAmount but not fully refunded = 'approved' or 'processing'

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Order by most recent first
    queryBuilder.orderBy('payment.refundedAt', 'DESC');

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
          paymentId: payment.id,
          amount: payment.amount,
          refundedAmount: payment.refundedAmount || 0,
          status: payment.status === 'refunded' ? 'processed' : 'approved',
          client: user
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
              }
            : null,
          reason: payment.metadata?.refundReason || 'Client request',
          processedAt: payment.refundedAt,
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
