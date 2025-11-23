import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { GetDashboardMetricsQuery } from './get-dashboard-metrics.query';
import { UserOrmEntity } from '../../../../../identity/infrastructure/persistence/user.orm-entity';
import { LawyerOrmEntity } from '../../../../../lawyer/infrastructure/persistence/lawyer.orm-entity';
import { LawyerStatus } from '../../../../../lawyer/domain/enums';
import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
  subDays,
  subWeeks,
  subMonths,
  subYears,
} from 'date-fns';

interface DashboardMetricsResult {
  totalRevenue: number;
  revenueChange: number;
  totalUsers: number;
  usersChange: number;
  activeLawyers: number;
  lawyersChange: number;
  totalConsultations: number;
  consultationsChange: number;
  averageRating: number;
  ratingChange: number;
  pendingVerifications: number;
  activeConsultations: number;
  todayRevenue: number;
  monthRevenue: number;
}

@QueryHandler(GetDashboardMetricsQuery)
export class GetDashboardMetricsHandler
  implements IQueryHandler<GetDashboardMetricsQuery>
{
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepo: Repository<UserOrmEntity>,
    @InjectRepository(LawyerOrmEntity)
    private readonly lawyerRepo: Repository<LawyerOrmEntity>,
    // TODO: Inject ConsultationRepository when available
    // TODO: Inject PaymentRepository when available
  ) {}

  async execute(
    query: GetDashboardMetricsQuery,
  ): Promise<DashboardMetricsResult> {
    const { dateRange, startDate, endDate } = query.dto;

    // Calculate date boundaries
    const now = new Date();
    const currentStartDate = this.getStartDate(dateRange || 'month', now);
    const previousStartDate = this.getPreviousStartDate(
      dateRange || 'month',
      currentStartDate,
    );

    // Total Users
    const totalUsers = await this.userRepo.count();
    const usersInCurrentPeriod = await this.userRepo.count({
      where: {
        createdAt: LessThan(currentStartDate) as any,
      },
    });
    const usersInPreviousPeriod = await this.userRepo.count({
      where: {
        createdAt: LessThan(previousStartDate) as any,
      },
    });
    const usersChange = this.calculatePercentChange(
      totalUsers - usersInCurrentPeriod,
      usersInCurrentPeriod - usersInPreviousPeriod,
    );

    // Active Lawyers
    const activeLawyers = await this.lawyerRepo.count({
      where: { status: LawyerStatus.Active },
    });
    const lawyersInCurrentPeriod = await this.lawyerRepo
      .createQueryBuilder('lawyer')
      .where('lawyer.status = :status', { status: LawyerStatus.Active })
      .andWhere('lawyer.createdAt < :date', { date: currentStartDate })
      .getCount();
    const lawyersInPreviousPeriod = await this.lawyerRepo
      .createQueryBuilder('lawyer')
      .where('lawyer.status = :status', { status: LawyerStatus.Active })
      .andWhere('lawyer.createdAt < :date', { date: previousStartDate })
      .getCount();
    const lawyersChange = this.calculatePercentChange(
      activeLawyers - lawyersInCurrentPeriod,
      lawyersInCurrentPeriod - lawyersInPreviousPeriod,
    );

    // Average Rating
    const avgRatingResult = await this.lawyerRepo
      .createQueryBuilder('lawyer')
      .select('AVG(lawyer.ratingValue)', 'avg')
      .where('lawyer.status = :status', { status: LawyerStatus.Active })
      .andWhere('lawyer.reviewCount > 0')
      .getRawOne();
    const averageRating = parseFloat(avgRatingResult?.avg || '0');

    // Previous period average rating for comparison
    const prevAvgRatingResult = await this.lawyerRepo
      .createQueryBuilder('lawyer')
      .select('AVG(lawyer.ratingValue)', 'avg')
      .where('lawyer.status = :status', { status: LawyerStatus.Active })
      .andWhere('lawyer.reviewCount > 0')
      .andWhere('lawyer.updatedAt < :date', { date: currentStartDate })
      .getRawOne();
    const previousAverageRating = parseFloat(prevAvgRatingResult?.avg || '0');
    const ratingChange = this.calculatePercentChange(
      averageRating,
      previousAverageRating,
    );

    // Pending Verifications
    const pendingVerifications = await this.lawyerRepo.count({
      where: [
        { status: LawyerStatus.PendingVerification },
        { status: LawyerStatus.InReview },
        { status: LawyerStatus.DocumentsRequested },
      ],
    });

    // TODO: Get consultation data when consultation module is integrated
    const totalConsultations = 0;
    const consultationsChange = 0;
    const activeConsultations = 0;

    // TODO: Get revenue data when payment module is integrated
    const totalRevenue = 0;
    const revenueChange = 0;
    const todayRevenue = 0;
    const monthRevenue = 0;

    return {
      totalRevenue,
      revenueChange,
      totalUsers,
      usersChange,
      activeLawyers,
      lawyersChange,
      totalConsultations,
      consultationsChange,
      averageRating,
      ratingChange,
      pendingVerifications,
      activeConsultations,
      todayRevenue,
      monthRevenue,
    };
  }

  private getStartDate(range: string, now: Date): Date {
    switch (range) {
      case 'today':
        return startOfDay(now);
      case 'week':
        return startOfWeek(now);
      case 'month':
        return startOfMonth(now);
      case 'year':
        return startOfYear(now);
      default:
        return startOfMonth(now);
    }
  }

  private getPreviousStartDate(range: string, startDate: Date): Date {
    // Calculate equivalent previous period
    switch (range) {
      case 'today':
        return subDays(startDate, 1);
      case 'week':
        return subWeeks(startDate, 1);
      case 'month':
        return subMonths(startDate, 1);
      case 'year':
        return subYears(startDate, 1);
      default:
        return subMonths(startDate, 1);
    }
  }

  private calculatePercentChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Number((((current - previous) / previous) * 100).toFixed(2));
  }
}
