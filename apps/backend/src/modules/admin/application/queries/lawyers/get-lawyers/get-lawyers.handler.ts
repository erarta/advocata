import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetLawyersQuery } from './get-lawyers.query';
import { LawyerOrmEntity } from '../../../../../lawyer/infrastructure/persistence/lawyer.orm-entity';
import { UserOrmEntity } from '../../../../../identity/infrastructure/persistence/user.orm-entity';
import { LawyerStatus } from '../../../../../lawyer/domain/enums/lawyer-status.enum';
import { VerificationStatus } from '../../../../../lawyer/domain/enums/verification-status.enum';

interface LawyerWithUser extends LawyerOrmEntity {
  user?: UserOrmEntity;
}

interface PaginatedResponse {
  items: LawyerWithUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@QueryHandler(GetLawyersQuery)
export class GetLawyersHandler implements IQueryHandler<GetLawyersQuery> {
  constructor(
    @InjectRepository(LawyerOrmEntity)
    private readonly lawyerRepository: Repository<LawyerOrmEntity>,
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
  ) {}

  async execute(query: GetLawyersQuery): Promise<PaginatedResponse> {
    const {
      search,
      status,
      verificationStatus,
      specializations,
      minRating,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query.dto;

    const queryBuilder = this.lawyerRepository
      .createQueryBuilder('lawyer')
      .leftJoinAndSelect('lawyer.userId', 'user');

    // Apply search filter (name, email, license number)
    if (search) {
      queryBuilder.leftJoin(
        UserOrmEntity,
        'searchUser',
        'searchUser.id = lawyer.userId',
      );
      queryBuilder.andWhere(
        '(LOWER(searchUser.firstName) LIKE LOWER(:search) OR LOWER(searchUser.lastName) LIKE LOWER(:search) OR LOWER(searchUser.email) LIKE LOWER(:search) OR lawyer.licenseNumber LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply status filter
    if (status) {
      const domainStatus = this.mapStatusToDomain(status as any);
      queryBuilder.andWhere('lawyer.status = :status', { status: domainStatus });
    }

    // Apply verification status filter
    if (verificationStatus) {
      const domainVerificationStatus = this.mapVerificationStatusToDomain(
        verificationStatus as any,
      );
      queryBuilder.andWhere('lawyer.verificationStatus = :verificationStatus', {
        verificationStatus: domainVerificationStatus,
      });
    }

    // Apply specialization filter
    if (specializations && specializations.length > 0) {
      const specializationConditions = specializations
        .map((spec) => `lawyer.specializations LIKE '%${spec}%'`)
        .join(' OR ');
      queryBuilder.andWhere(`(${specializationConditions})`);
    }

    // Apply minimum rating filter
    if (minRating !== undefined) {
      queryBuilder.andWhere('lawyer.ratingValue >= :minRating', {
        minRating,
      });
    }

    // Apply sorting
    const sortField = this.getSortField(sortBy);
    queryBuilder.orderBy(sortField, sortOrder.toUpperCase() as 'ASC' | 'DESC');

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Execute query
    const [rawItems, total] = await queryBuilder.getManyAndCount();

    // Fetch user data for each lawyer
    const items: LawyerWithUser[] = await Promise.all(
      rawItems.map(async (lawyer) => {
        const user = await this.userRepository.findOne({
          where: { id: lawyer.userId },
        });
        return {
          ...lawyer,
          user,
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

  private mapStatusToDomain(dtoStatus: string): LawyerStatus {
    const statusMap: Record<string, LawyerStatus> = {
      pending: LawyerStatus.PendingVerification,
      active: LawyerStatus.Active,
      inactive: LawyerStatus.Inactive,
      suspended: LawyerStatus.Suspended,
      rejected: LawyerStatus.Inactive,
    };
    return statusMap[dtoStatus] || LawyerStatus.PendingVerification;
  }

  private mapVerificationStatusToDomain(
    dtoStatus: string,
  ): VerificationStatus {
    const statusMap: Record<string, VerificationStatus> = {
      pending: VerificationStatus.Pending,
      verified: VerificationStatus.Approved,
      rejected: VerificationStatus.Rejected,
    };
    return statusMap[dtoStatus] || VerificationStatus.Pending;
  }

  private getSortField(sortBy: string): string {
    const fieldMap: Record<string, string> = {
      createdAt: 'lawyer.createdAt',
      rating: 'lawyer.ratingValue',
      experienceYears: 'lawyer.experienceYears',
      hourlyRate: 'lawyer.hourlyRate',
      status: 'lawyer.status',
      licenseNumber: 'lawyer.licenseNumber',
    };
    return fieldMap[sortBy] || 'lawyer.createdAt';
  }
}
