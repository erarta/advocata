import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { GetUserStatsQuery } from './get-user-stats.query';
import { UserOrmEntity } from '../../../../../identity/infrastructure/persistence/user.orm-entity';
import { UserStatus } from '../../../../../identity/domain/enums/user-status.enum';

interface UserStatsResponse {
  totalUsers: number;
  activeUsers: number;
  pendingVerification: number;
  suspendedUsers: number;
  bannedUsers: number;
  deletedUsers: number;
  newUsersThisMonth: number;
  activeUsersLast30Days: number;
  verifiedEmailUsers: number;
  verifiedPhoneUsers: number;
}

@QueryHandler(GetUserStatsQuery)
export class GetUserStatsHandler implements IQueryHandler<GetUserStatsQuery> {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
  ) {}

  async execute(): Promise<UserStatsResponse> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get total users count
    const totalUsers = await this.userRepository.count();

    // Get counts by status
    const activeUsers = await this.userRepository.count({
      where: { status: UserStatus.Active },
    });

    const pendingVerification = await this.userRepository.count({
      where: { status: UserStatus.PendingVerification },
    });

    const suspendedUsers = await this.userRepository.count({
      where: { status: UserStatus.Suspended },
    });

    const bannedUsers = await this.userRepository.count({
      where: { status: UserStatus.Banned },
    });

    const deletedUsers = await this.userRepository.count({
      where: { status: UserStatus.Deleted },
    });

    // Get new users this month
    const newUsersThisMonth = await this.userRepository.count({
      where: {
        createdAt: MoreThan(firstDayOfMonth),
      },
    });

    // Get active users in last 30 days (logged in within 30 days)
    const activeUsersLast30Days = await this.userRepository.count({
      where: {
        lastLoginAt: MoreThan(thirtyDaysAgo),
      },
    });

    // Get verified users
    const verifiedEmailUsers = await this.userRepository.count({
      where: { isEmailVerified: true },
    });

    const verifiedPhoneUsers = await this.userRepository.count({
      where: { isPhoneVerified: true },
    });

    return {
      totalUsers,
      activeUsers,
      pendingVerification,
      suspendedUsers,
      bannedUsers,
      deletedUsers,
      newUsersThisMonth,
      activeUsersLast30Days,
      verifiedEmailUsers,
      verifiedPhoneUsers,
    };
  }
}
