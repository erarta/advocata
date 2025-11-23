import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetEmergencyCallsQuery } from './get-emergency-calls.query';
import { EmergencyCallOrmEntity } from '../../../../../emergency-call/infrastructure/persistence/emergency-call.orm-entity';
import { UserOrmEntity } from '../../../../../identity/infrastructure/persistence/user.orm-entity';
import { LawyerOrmEntity } from '../../../../../lawyer/infrastructure/persistence/lawyer.orm-entity';

interface EmergencyCallDetail {
  id: string;
  status: string;
  address: string;
  latitude: number;
  longitude: number;
  notes: string | null;
  createdAt: Date;
  acceptedAt: Date | null;
  completedAt: Date | null;
  responseTime?: number; // minutes
  client: {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string;
  };
  lawyer?: {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string;
  };
}

interface PaginatedEmergencyCallsResponse {
  items: EmergencyCallDetail[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@QueryHandler(GetEmergencyCallsQuery)
export class GetEmergencyCallsHandler
  implements IQueryHandler<GetEmergencyCallsQuery>
{
  constructor(
    @InjectRepository(EmergencyCallOrmEntity)
    private readonly emergencyCallRepository: Repository<EmergencyCallOrmEntity>,
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
    @InjectRepository(LawyerOrmEntity)
    private readonly lawyerRepository: Repository<LawyerOrmEntity>,
  ) {}

  async execute(
    query: GetEmergencyCallsQuery,
  ): Promise<PaginatedEmergencyCallsResponse> {
    const { status, page = 1, limit = 20 } = query.dto;

    const queryBuilder = this.emergencyCallRepository.createQueryBuilder('ec');

    // Join with client and lawyer (if assigned)
    queryBuilder
      .leftJoin(UserOrmEntity, 'client', 'client.id = ec.user_id')
      .leftJoin(LawyerOrmEntity, 'lawyer', 'lawyer.id = ec.lawyer_id')
      .select([
        'ec.id',
        'ec.status',
        'ec.address',
        'ec.latitude',
        'ec.longitude',
        'ec.notes',
        'ec.created_at as "createdAt"',
        'ec.accepted_at as "acceptedAt"',
        'ec.completed_at as "completedAt"',
        'client.id as "client_id"',
        'client.firstName as "client_firstName"',
        'client.lastName as "client_lastName"',
        'client.email as "client_email"',
        'client.phoneNumber as "client_phoneNumber"',
        'lawyer.id as "lawyer_id"',
        'lawyer.firstName as "lawyer_firstName"',
        'lawyer.lastName as "lawyer_lastName"',
        'lawyer.email as "lawyer_email"',
        'lawyer.phoneNumber as "lawyer_phoneNumber"',
      ]);

    // Apply status filter
    if (status) {
      queryBuilder.where('ec.status = :status', { status });
    }

    // Count total
    const totalQuery = queryBuilder.clone();
    const total = await totalQuery.getCount();

    // Apply sorting (most recent first)
    queryBuilder.orderBy('ec.created_at', 'DESC');

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Execute query
    const rawResults = await queryBuilder.getRawMany();

    // Transform results
    const items: EmergencyCallDetail[] = rawResults.map((row) => {
      const item: EmergencyCallDetail = {
        id: row.id,
        status: row.status,
        address: row.address,
        latitude: row.latitude,
        longitude: row.longitude,
        notes: row.notes,
        createdAt: row.createdAt,
        acceptedAt: row.acceptedAt,
        completedAt: row.completedAt,
        client: {
          id: row.client_id,
          name: `${row.client_firstName} ${row.client_lastName}`.trim(),
          email: row.client_email,
          phoneNumber: row.client_phoneNumber,
        },
      };

      // Add lawyer if assigned
      if (row.lawyer_id) {
        item.lawyer = {
          id: row.lawyer_id,
          name: `${row.lawyer_firstName} ${row.lawyer_lastName}`.trim(),
          email: row.lawyer_email,
          phoneNumber: row.lawyer_phoneNumber,
        };

        // Calculate response time if accepted
        if (row.acceptedAt) {
          const created = new Date(row.createdAt).getTime();
          const accepted = new Date(row.acceptedAt).getTime();
          item.responseTime = Math.round((accepted - created) / 60000); // minutes
        }
      }

      return item;
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
