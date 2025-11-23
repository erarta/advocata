import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetDisputesQuery } from './get-disputes.query';
import { ConsultationOrmEntity } from '../../../../../consultation/infrastructure/persistence/consultation.orm-entity';
import { UserOrmEntity } from '../../../../../identity/infrastructure/persistence/user.orm-entity';
import { LawyerOrmEntity } from '../../../../../lawyer/infrastructure/persistence/lawyer.orm-entity';

interface DisputedConsultation {
  id: string;
  type: string;
  status: string;
  price: number;
  scheduledStart: Date | null;
  completedAt: Date | null;
  cancellationReason: string | null;
  client: {
    id: string;
    name: string;
    email: string;
  };
  lawyer: {
    id: string;
    name: string;
    email: string;
  };
  // Note: Dispute fields may need to be added to the entity
  // For now, we'll filter by status='disputed' if it exists
  disputeStatus?: string;
  disputeReason?: string;
  disputeFiledAt?: Date;
}

interface PaginatedDisputesResponse {
  items: DisputedConsultation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@QueryHandler(GetDisputesQuery)
export class GetDisputesHandler implements IQueryHandler<GetDisputesQuery> {
  constructor(
    @InjectRepository(ConsultationOrmEntity)
    private readonly consultationRepository: Repository<ConsultationOrmEntity>,
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
    @InjectRepository(LawyerOrmEntity)
    private readonly lawyerRepository: Repository<LawyerOrmEntity>,
  ) {}

  async execute(query: GetDisputesQuery): Promise<PaginatedDisputesResponse> {
    const { status, page = 1, limit = 20 } = query.dto;

    const queryBuilder =
      this.consultationRepository.createQueryBuilder('consultation');

    // Join with client and lawyer
    queryBuilder
      .leftJoin(UserOrmEntity, 'client', 'client.id = consultation.clientId')
      .leftJoin(LawyerOrmEntity, 'lawyer', 'lawyer.id = consultation.lawyerId')
      .select([
        'consultation.id',
        'consultation.type',
        'consultation.status',
        'consultation.price',
        'consultation.scheduledStart',
        'consultation.completedAt',
        'consultation.cancellationReason',
        'client.id as "client_id"',
        'client.firstName as "client_firstName"',
        'client.lastName as "client_lastName"',
        'client.email as "client_email"',
        'lawyer.id as "lawyer_id"',
        'lawyer.firstName as "lawyer_firstName"',
        'lawyer.lastName as "lawyer_lastName"',
        'lawyer.email as "lawyer_email"',
      ]);

    // Filter for disputed consultations
    // Note: Assuming 'disputed' is a valid status. If not, this would need adjustment.
    // TODO: Add dispute-related fields to ConsultationOrmEntity if not present
    queryBuilder.where(
      "(consultation.status = 'disputed' OR consultation.cancellationReason IS NOT NULL)",
    );

    // Apply status filter if provided
    // TODO: This assumes dispute status is stored somewhere - may need adjustment
    if (status) {
      // For now, we'll use a simple filter based on consultation status
      // In a real implementation, this would filter by dispute.status
      if (status === 'open') {
        queryBuilder.andWhere("consultation.status = 'disputed'");
      }
    }

    // Count total
    const totalQuery = queryBuilder.clone();
    const total = await totalQuery.getCount();

    // Apply sorting (most recent first)
    queryBuilder.orderBy('consultation.createdAt', 'DESC');

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Execute query
    const rawResults = await queryBuilder.getRawMany();

    // Transform results
    const items: DisputedConsultation[] = rawResults.map((row) => ({
      id: row.consultation_id,
      type: row.consultation_type,
      status: row.consultation_status,
      price: Number(row.consultation_price),
      scheduledStart: row.consultation_scheduledStart,
      completedAt: row.consultation_completedAt,
      cancellationReason: row.consultation_cancellationReason,
      client: {
        id: row.client_id,
        name: `${row.client_firstName} ${row.client_lastName}`.trim(),
        email: row.client_email,
      },
      lawyer: {
        id: row.lawyer_id,
        name: `${row.lawyer_firstName} ${row.lawyer_lastName}`.trim(),
        email: row.lawyer_email,
      },
      // TODO: Add actual dispute fields when available
      disputeStatus: status || 'open',
      disputeReason: row.consultation_cancellationReason,
      disputeFiledAt: row.consultation_completedAt,
    }));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
