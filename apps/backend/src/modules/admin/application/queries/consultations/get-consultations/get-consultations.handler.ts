import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetConsultationsQuery } from './get-consultations.query';
import { ConsultationOrmEntity } from '../../../../../consultation/infrastructure/persistence/consultation.orm-entity';
import { UserOrmEntity } from '../../../../../identity/infrastructure/persistence/user.orm-entity';
import { LawyerOrmEntity } from '../../../../../lawyer/infrastructure/persistence/lawyer.orm-entity';

interface ConsultationWithRelations extends ConsultationOrmEntity {
  client?: UserOrmEntity;
  lawyer?: LawyerOrmEntity;
  duration?: number;
}

interface PaginatedResponse {
  items: ConsultationWithRelations[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@QueryHandler(GetConsultationsQuery)
export class GetConsultationsHandler
  implements IQueryHandler<GetConsultationsQuery>
{
  constructor(
    @InjectRepository(ConsultationOrmEntity)
    private readonly consultationRepository: Repository<ConsultationOrmEntity>,
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
    @InjectRepository(LawyerOrmEntity)
    private readonly lawyerRepository: Repository<LawyerOrmEntity>,
  ) {}

  async execute(query: GetConsultationsQuery): Promise<PaginatedResponse> {
    const {
      search,
      status,
      clientId,
      lawyerId,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      sortBy = 'scheduledStart',
      sortOrder = 'desc',
    } = query.dto;

    const queryBuilder =
      this.consultationRepository.createQueryBuilder('consultation');

    // Join with client and lawyer for filtering and display
    queryBuilder
      .leftJoin(UserOrmEntity, 'client', 'client.id = consultation.clientId')
      .leftJoin(LawyerOrmEntity, 'lawyer', 'lawyer.id = consultation.lawyerId')
      .select([
        'consultation.*',
        'client.id as "client_id"',
        'client.firstName as "client_firstName"',
        'client.lastName as "client_lastName"',
        'client.email as "client_email"',
        'client.avatarUrl as "client_avatarUrl"',
        'lawyer.id as "lawyer_id"',
        'lawyer.firstName as "lawyer_firstName"',
        'lawyer.lastName as "lawyer_lastName"',
        'lawyer.email as "lawyer_email"',
        'lawyer.avatarUrl as "lawyer_avatarUrl"',
      ]);

    // Apply search filter (search by client or lawyer name)
    if (search) {
      queryBuilder.andWhere(
        '(LOWER(client.firstName) LIKE LOWER(:search) OR LOWER(client.lastName) LIKE LOWER(:search) OR LOWER(lawyer.firstName) LIKE LOWER(:search) OR LOWER(lawyer.lastName) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    // Apply status filter
    if (status) {
      queryBuilder.andWhere('consultation.status = :status', { status });
    }

    // Apply client filter
    if (clientId) {
      queryBuilder.andWhere('consultation.clientId = :clientId', { clientId });
    }

    // Apply lawyer filter
    if (lawyerId) {
      queryBuilder.andWhere('consultation.lawyerId = :lawyerId', { lawyerId });
    }

    // Apply date range filter
    if (startDate) {
      queryBuilder.andWhere('consultation.scheduledStart >= :startDate', {
        startDate,
      });
    }

    if (endDate) {
      queryBuilder.andWhere('consultation.scheduledStart <= :endDate', {
        endDate,
      });
    }

    // Count total before pagination
    const totalQuery = queryBuilder.clone();
    const total = await totalQuery.getCount();

    // Apply sorting
    const sortField = this.getSortField(sortBy);
    queryBuilder.orderBy(sortField, sortOrder.toUpperCase() as 'ASC' | 'DESC');

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Execute query
    const rawResults = await queryBuilder.getRawMany();

    // Transform results to include relations and calculated fields
    const items = rawResults.map((row) => this.transformRow(row));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private transformRow(row: any): ConsultationWithRelations {
    const consultation: any = {
      id: row.consultation_id,
      clientId: row.consultation_clientId,
      lawyerId: row.consultation_lawyerId,
      type: row.consultation_type,
      status: row.consultation_status,
      description: row.consultation_description,
      price: Number(row.consultation_price),
      currency: row.consultation_currency,
      scheduledStart: row.consultation_scheduledStart,
      scheduledEnd: row.consultation_scheduledEnd,
      confirmedAt: row.consultation_confirmedAt,
      startedAt: row.consultation_startedAt,
      completedAt: row.consultation_completedAt,
      cancelledAt: row.consultation_cancelledAt,
      rating: row.consultation_rating,
      review: row.consultation_review,
      cancellationReason: row.consultation_cancellationReason,
      createdAt: row.consultation_createdAt,
      updatedAt: row.consultation_updatedAt,
    };

    // Add client relation if exists
    if (row.client_id) {
      consultation.client = {
        id: row.client_id,
        firstName: row.client_firstName,
        lastName: row.client_lastName,
        email: row.client_email,
        avatarUrl: row.client_avatarUrl,
      };
    }

    // Add lawyer relation if exists
    if (row.lawyer_id) {
      consultation.lawyer = {
        id: row.lawyer_id,
        firstName: row.lawyer_firstName,
        lastName: row.lawyer_lastName,
        email: row.lawyer_email,
        avatarUrl: row.lawyer_avatarUrl,
      };
    }

    // Calculate duration if applicable
    if (row.consultation_startedAt && row.consultation_completedAt) {
      const start = new Date(row.consultation_startedAt).getTime();
      const end = new Date(row.consultation_completedAt).getTime();
      consultation.duration = Math.round((end - start) / 60000); // minutes
    } else if (row.consultation_startedAt && row.consultation_status === 'in_progress') {
      const start = new Date(row.consultation_startedAt).getTime();
      const now = Date.now();
      consultation.duration = Math.round((now - start) / 60000); // minutes
    }

    return consultation;
  }

  private getSortField(sortBy: string): string {
    const fieldMap: Record<string, string> = {
      scheduledStart: 'consultation.scheduledStart',
      createdAt: 'consultation.createdAt',
      price: 'consultation.price',
      status: 'consultation.status',
      type: 'consultation.type',
    };
    return fieldMap[sortBy] || 'consultation.scheduledStart';
  }
}
