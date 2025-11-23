import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetUsersQuery } from './get-users.query';
import { UserOrmEntity } from '../../../../../identity/infrastructure/persistence/user.orm-entity';
import { UserStatus } from '../../../../../identity/domain/enums/user-status.enum';
import { UserRole } from '../../../../../identity/domain/enums/user-role.enum';

interface PaginatedResponse {
  items: UserOrmEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery> {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
  ) {}

  async execute(query: GetUsersQuery): Promise<PaginatedResponse> {
    const {
      search,
      status,
      role,
      emailVerified,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query.dto;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    // Apply search filter
    if (search) {
      queryBuilder.andWhere(
        '(LOWER(user.firstName) LIKE LOWER(:search) OR LOWER(user.lastName) LIKE LOWER(:search) OR LOWER(user.email) LIKE LOWER(:search) OR user.phoneNumber LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply status filter (map DTO enum to domain enum)
    if (status) {
      const domainStatus = this.mapStatusToDomain(status as any);
      queryBuilder.andWhere('user.status = :status', { status: domainStatus });
    }

    // Apply role filter (map DTO enum to domain enum)
    if (role) {
      const domainRole = this.mapRoleToDomain(role as any);
      queryBuilder.andWhere('user.role = :role', { role: domainRole });
    }

    // Apply email verified filter
    if (emailVerified !== undefined) {
      queryBuilder.andWhere('user.isEmailVerified = :emailVerified', {
        emailVerified,
      });
    }

    // Apply sorting
    const sortField = this.getSortField(sortBy);
    queryBuilder.orderBy(sortField, sortOrder.toUpperCase() as 'ASC' | 'DESC');

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Execute query
    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private mapStatusToDomain(dtoStatus: string): UserStatus {
    const statusMap: Record<string, UserStatus> = {
      active: UserStatus.Active,
      inactive: UserStatus.PendingVerification,
      suspended: UserStatus.Suspended,
      banned: UserStatus.Banned,
    };
    return statusMap[dtoStatus] || UserStatus.Active;
  }

  private mapRoleToDomain(dtoRole: string): UserRole {
    const roleMap: Record<string, UserRole> = {
      client: UserRole.Client,
      lawyer: UserRole.Lawyer,
      admin: UserRole.Admin,
      super_admin: UserRole.Admin, // Map super_admin to Admin for now
    };
    return roleMap[dtoRole] || UserRole.Client;
  }

  private getSortField(sortBy: string): string {
    const fieldMap: Record<string, string> = {
      createdAt: 'user.createdAt',
      lastLoginAt: 'user.lastLoginAt',
      email: 'user.email',
      firstName: 'user.firstName',
      lastName: 'user.lastName',
      status: 'user.status',
      role: 'user.role',
    };
    return fieldMap[sortBy] || 'user.createdAt';
  }
}
