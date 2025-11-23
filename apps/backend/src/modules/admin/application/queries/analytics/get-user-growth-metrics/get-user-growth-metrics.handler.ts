import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan } from 'typeorm';
import { GetUserGrowthMetricsQuery } from './get-user-growth-metrics.query';
import { UserOrmEntity } from '../../../../../identity/infrastructure/persistence/user.orm-entity';
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
  eachMonthOfInterval,
  subDays,
} from 'date-fns';

interface UserGrowthMetricsResult {
  total: number;
  newUsers: number;
  activeUsers: number;
  retentionRate: number;
  churnRate: number;
  growthRate: number;
  timeline: Array<{
    period: string;
    newUsers: number;
    activeUsers: number;
    totalUsers: number;
    growthRate: number;
  }>;
}

@QueryHandler(GetUserGrowthMetricsQuery)
export class GetUserGrowthMetricsHandler
  implements IQueryHandler<GetUserGrowthMetricsQuery>
{
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepo: Repository<UserOrmEntity>,
  ) {}

  async execute(
    query: GetUserGrowthMetricsQuery,
  ): Promise<UserGrowthMetricsResult> {
    const { startDate, endDate, groupBy } = query.dto;

    const now = new Date();
    const start = startDate ? new Date(startDate) : subMonths(now, 6);
    const end = endDate ? new Date(endDate) : now;

    // Total users
    const total = await this.userRepo.count();

    // New users in current period
    const newUsers = await this.userRepo.count({
      where: {
        createdAt: Between(start, end) as any,
      },
    });

    // Active users (logged in during period)
    const activeUsers = await this.userRepo.count({
      where: {
        lastLoginAt: Between(start, end) as any,
      },
    });

    // Active in last 30 days
    const thirtyDaysAgo = subDays(now, 30);
    const activeInLast30Days = await this.userRepo.count({
      where: {
        lastLoginAt: MoreThan(thirtyDaysAgo) as any,
      },
    });

    // Calculate retention rate
    const retentionRate = total > 0 ? (activeInLast30Days / total) * 100 : 0;

    // Calculate churn rate
    const inactiveUsers = total - activeInLast30Days;
    const churnRate = total > 0 ? (inactiveUsers / total) * 100 : 0;

    // Calculate growth rate (new users / total users * 100)
    const growthRate = total > 0 ? (newUsers / (total - newUsers)) * 100 : 0;

    // Build timeline
    const months = eachMonthOfInterval({ start, end });
    const timeline = await Promise.all(
      months.map(async (month, index) => {
        const monthEnd = endOfMonth(month);
        const prevMonth = index > 0 ? months[index - 1] : subMonths(month, 1);
        const prevMonthEnd = endOfMonth(prevMonth);

        const newUsersInMonth = await this.userRepo.count({
          where: {
            createdAt: Between(month, monthEnd) as any,
          },
        });

        const totalAtEnd = await this.userRepo.count({
          where: {
            createdAt: MoreThan(monthEnd) as any,
          },
        });

        const totalAtPrevEnd = await this.userRepo.count({
          where: {
            createdAt: MoreThan(prevMonthEnd) as any,
          },
        });

        const activeInMonth = await this.userRepo.count({
          where: {
            lastLoginAt: Between(month, monthEnd) as any,
          },
        });

        const monthGrowthRate =
          totalAtPrevEnd > 0
            ? ((totalAtEnd - totalAtPrevEnd) / totalAtPrevEnd) * 100
            : 0;

        return {
          period: format(month, 'yyyy-MM'),
          newUsers: newUsersInMonth,
          activeUsers: activeInMonth,
          totalUsers: totalAtEnd,
          growthRate: Number(monthGrowthRate.toFixed(2)),
        };
      }),
    );

    return {
      total,
      newUsers,
      activeUsers,
      retentionRate: Number(retentionRate.toFixed(2)),
      churnRate: Number(churnRate.toFixed(2)),
      growthRate: Number(growthRate.toFixed(2)),
      timeline,
    };
  }
}
