import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan } from 'typeorm';
import { GetUserGrowthQuery } from './get-user-growth.query';
import { UserOrmEntity } from '../../../../../identity/infrastructure/persistence/user.orm-entity';
import { UserRole } from '../../../../../identity/domain/enums/user-role.enum';
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  subDays,
  format,
  eachMonthOfInterval,
  differenceInDays,
} from 'date-fns';

interface UserGrowthResult {
  overview: {
    total: number;
    newThisMonth: number;
    newThisWeek: number;
    activeUsers: number;
    retentionRate: number;
    churnRate: number;
  };
  timeline: Array<{
    date: string;
    newUsers: number;
    activeUsers: number;
    totalUsers: number;
  }>;
  byRole: {
    clients: number;
    lawyers: number;
  };
  bySource: Array<{
    source: string;
    count: number;
    percentage: number;
  }>;
  cohorts: Array<{
    month: string;
    usersAcquired: number;
    retention30d: number;
    retention60d: number;
    retention90d: number;
  }>;
}

@QueryHandler(GetUserGrowthQuery)
export class GetUserGrowthHandler implements IQueryHandler<GetUserGrowthQuery> {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepo: Repository<UserOrmEntity>,
  ) {}

  async execute(query: GetUserGrowthQuery): Promise<UserGrowthResult> {
    const { startDate, endDate, groupBy } = query.dto;

    const now = new Date();
    const start = startDate ? new Date(startDate) : subMonths(now, 6);
    const end = endDate ? new Date(endDate) : now;

    // Total users
    const total = await this.userRepo.count();

    // New users this month
    const monthStart = startOfMonth(now);
    const newThisMonth = await this.userRepo.count({
      where: {
        createdAt: MoreThan(monthStart) as any,
      },
    });

    // New users this week (last 7 days)
    const weekStart = subDays(now, 7);
    const newThisWeek = await this.userRepo.count({
      where: {
        createdAt: MoreThan(weekStart) as any,
      },
    });

    // Active users (logged in last 30 days)
    const thirtyDaysAgo = subDays(now, 30);
    const activeUsers = await this.userRepo.count({
      where: {
        lastLoginAt: MoreThan(thirtyDaysAgo) as any,
      },
    });

    // Users by role
    const clients = await this.userRepo.count({
      where: { role: UserRole.Client },
    });
    const lawyers = await this.userRepo.count({
      where: { role: UserRole.Lawyer },
    });

    // Calculate retention rate (active users / total users * 100)
    const retentionRate = total > 0 ? (activeUsers / total) * 100 : 0;

    // Calculate churn rate (users not active in last 30 days / total * 100)
    const inactiveUsers = total - activeUsers;
    const churnRate = total > 0 ? (inactiveUsers / total) * 100 : 0;

    // Build timeline - group by month
    const months = eachMonthOfInterval({ start, end });
    const timeline = await Promise.all(
      months.map(async (month) => {
        const monthEnd = endOfMonth(month);
        const newUsersInMonth = await this.userRepo.count({
          where: {
            createdAt: Between(month, monthEnd) as any,
          },
        });

        const totalUsersAtEnd = await this.userRepo.count({
          where: {
            createdAt: MoreThan(monthEnd) as any,
          },
        });

        const activeInMonth = await this.userRepo.count({
          where: {
            lastLoginAt: Between(month, monthEnd) as any,
          },
        });

        return {
          date: format(month, 'yyyy-MM'),
          newUsers: newUsersInMonth,
          activeUsers: activeInMonth,
          totalUsers: totalUsersAtEnd,
        };
      }),
    );

    // Build cohorts (last 6 months)
    const cohortMonths = eachMonthOfInterval({
      start: subMonths(now, 5),
      end: now,
    });
    const cohorts = await Promise.all(
      cohortMonths.map(async (cohortMonth) => {
        const cohortStart = startOfMonth(cohortMonth);
        const cohortEnd = endOfMonth(cohortMonth);

        // Users acquired in this cohort
        const usersAcquired = await this.userRepo.count({
          where: {
            createdAt: Between(cohortStart, cohortEnd) as any,
          },
        });

        // Get user IDs for retention calculation
        const cohortUsers = await this.userRepo.find({
          where: {
            createdAt: Between(cohortStart, cohortEnd) as any,
          },
          select: ['id'],
        });
        const cohortUserIds = cohortUsers.map((u) => u.id);

        // Calculate retention at different intervals
        const retention30d =
          usersAcquired > 0
            ? await this.calculateRetention(
                cohortUserIds,
                cohortEnd,
                subDays(cohortEnd, -30),
              )
            : 0;
        const retention60d =
          usersAcquired > 0
            ? await this.calculateRetention(
                cohortUserIds,
                cohortEnd,
                subDays(cohortEnd, -60),
              )
            : 0;
        const retention90d =
          usersAcquired > 0
            ? await this.calculateRetention(
                cohortUserIds,
                cohortEnd,
                subDays(cohortEnd, -90),
              )
            : 0;

        return {
          month: format(cohortMonth, 'yyyy-MM'),
          usersAcquired,
          retention30d,
          retention60d,
          retention90d,
        };
      }),
    );

    // TODO: Track user acquisition source in database
    const bySource = [
      { source: 'organic', count: Math.floor(total * 0.6), percentage: 60 },
      { source: 'referral', count: Math.floor(total * 0.25), percentage: 25 },
      { source: 'google', count: Math.floor(total * 0.1), percentage: 10 },
      { source: 'social', count: Math.floor(total * 0.05), percentage: 5 },
    ];

    return {
      overview: {
        total,
        newThisMonth,
        newThisWeek,
        activeUsers,
        retentionRate: Number(retentionRate.toFixed(2)),
        churnRate: Number(churnRate.toFixed(2)),
      },
      timeline,
      byRole: {
        clients,
        lawyers,
      },
      bySource,
      cohorts,
    };
  }

  private async calculateRetention(
    userIds: string[],
    cohortEnd: Date,
    checkDate: Date,
  ): Promise<number> {
    if (userIds.length === 0) return 0;
    if (checkDate > new Date()) return 0; // Can't calculate future retention

    const activeCount = await this.userRepo
      .createQueryBuilder('user')
      .where('user.id IN (:...userIds)', { userIds })
      .andWhere('user.lastLoginAt >= :cohortEnd', { cohortEnd })
      .andWhere('user.lastLoginAt <= :checkDate', { checkDate })
      .getCount();

    return Number(((activeCount / userIds.length) * 100).toFixed(2));
  }
}
