import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetPendingLawyersQuery } from './get-pending-lawyers.query';
import { LawyerOrmEntity } from '../../../../../lawyer/infrastructure/persistence/lawyer.orm-entity';
import { UserOrmEntity } from '../../../../../identity/infrastructure/persistence/user.orm-entity';
import { VerificationStatus } from '../../../../../lawyer/domain/enums/verification-status.enum';

interface LawyerWithUser extends LawyerOrmEntity {
  user?: UserOrmEntity;
  isUrgent?: boolean;
}

interface PaginatedResponse {
  items: LawyerWithUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@QueryHandler(GetPendingLawyersQuery)
export class GetPendingLawyersHandler
  implements IQueryHandler<GetPendingLawyersQuery>
{
  constructor(
    @InjectRepository(LawyerOrmEntity)
    private readonly lawyerRepository: Repository<LawyerOrmEntity>,
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
  ) {}

  async execute(query: GetPendingLawyersQuery): Promise<PaginatedResponse> {
    const { search, page = 1, limit = 20 } = query.dto;

    const queryBuilder = this.lawyerRepository.createQueryBuilder('lawyer');

    // Filter for pending verification statuses
    queryBuilder.andWhere('lawyer.verificationStatus IN (:...statuses)', {
      statuses: [
        VerificationStatus.Pending,
        VerificationStatus.InReview,
        VerificationStatus.DocumentsRequested,
      ],
    });

    // Apply search filter
    if (search) {
      queryBuilder.leftJoin(
        UserOrmEntity,
        'searchUser',
        'searchUser.id = lawyer.userId',
      );
      queryBuilder.andWhere(
        '(LOWER(searchUser.firstName) LIKE LOWER(:search) OR LOWER(searchUser.lastName) LIKE LOWER(:search) OR LOWER(searchUser.email) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    // Sort by creation date (oldest first = most urgent)
    queryBuilder.orderBy('lawyer.createdAt', 'ASC');

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Execute query
    const [rawItems, total] = await queryBuilder.getManyAndCount();

    // Fetch user data and mark urgent items
    const items: LawyerWithUser[] = await Promise.all(
      rawItems.map(async (lawyer) => {
        const user = await this.userRepository.findOne({
          where: { id: lawyer.userId },
        });

        // Mark as urgent if pending for more than 3 days
        const daysPending =
          (Date.now() - lawyer.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        const isUrgent = daysPending > 3;

        return {
          ...lawyer,
          user,
          isUrgent,
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
