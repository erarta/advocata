import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetLawyerPerformanceAnalyticsQuery } from './get-lawyer-performance-analytics.query';
import { LawyerOrmEntity } from '../../../../../lawyer/infrastructure/persistence/lawyer.orm-entity';
import { LawyerStatus } from '../../../../../lawyer/domain/enums';
import { format, startOfMonth, subMonths, eachMonthOfInterval } from 'date-fns';

interface LawyerPerformanceResult {
  overview: {
    totalLawyers: number;
    activeLawyers: number;
    averageRating: number;
    averageResponseTime: number;
    averageConsultations: number;
    completionRate: number;
  };
  topPerformers: Array<{
    id: string;
    name: string;
    rating: number;
    consultations: number;
    revenue: number;
    responseTime: number;
  }>;
  specializations: Array<{
    name: string;
    lawyersCount: number;
    consultationsCount: number;
    averageRating: number;
    revenue: number;
  }>;
  satisfactionTrend: Array<{
    date: string;
    averageRating: number;
    reviewsCount: number;
  }>;
}

@QueryHandler(GetLawyerPerformanceAnalyticsQuery)
export class GetLawyerPerformanceAnalyticsHandler
  implements IQueryHandler<GetLawyerPerformanceAnalyticsQuery>
{
  constructor(
    @InjectRepository(LawyerOrmEntity)
    private readonly lawyerRepo: Repository<LawyerOrmEntity>,
    // TODO: Inject ConsultationRepository when available
  ) {}

  async execute(
    query: GetLawyerPerformanceAnalyticsQuery,
  ): Promise<LawyerPerformanceResult> {
    const { dateRange, startDate, endDate, lawyerId } = query.dto;

    const now = new Date();
    const start = startDate ? new Date(startDate) : subMonths(now, 6);
    const end = endDate ? new Date(endDate) : now;

    // Total and active lawyers
    const totalLawyers = await this.lawyerRepo.count();
    const activeLawyers = await this.lawyerRepo.count({
      where: { status: LawyerStatus.Active, isAvailable: true },
    });

    // Average rating across all lawyers
    const avgRatingResult = await this.lawyerRepo
      .createQueryBuilder('lawyer')
      .select('AVG(lawyer.ratingValue)', 'avg')
      .where('lawyer.status = :status', { status: LawyerStatus.Active })
      .andWhere('lawyer.reviewCount > 0')
      .getRawOne();
    const averageRating = parseFloat(avgRatingResult?.avg || '0');

    // TODO: Calculate from actual consultation data
    const averageResponseTime = 0; // minutes
    const averageConsultations = 0; // per lawyer
    const completionRate = 0; // %

    // Get top performers
    const topPerformers = await this.lawyerRepo
      .createQueryBuilder('lawyer')
      .where('lawyer.status = :status', { status: LawyerStatus.Active })
      .andWhere('lawyer.reviewCount > 0')
      .orderBy('lawyer.ratingValue', 'DESC')
      .addOrderBy('lawyer.reviewCount', 'DESC')
      .limit(10)
      .getMany();

    const topPerformersData = topPerformers.map((lawyer) => ({
      id: lawyer.id,
      name: `Lawyer ${lawyer.id.substring(0, 8)}`, // TODO: Get from user
      rating: Number(lawyer.ratingValue),
      consultations: 0, // TODO: Count from consultations
      revenue: 0, // TODO: Calculate from payments
      responseTime: 0, // TODO: Calculate from consultations
    }));

    // Get specializations breakdown
    const allLawyers = await this.lawyerRepo.find({
      where: { status: LawyerStatus.Active },
    });

    // Count lawyers and calculate stats by specialization
    const specializationsMap = new Map<
      string,
      {
        lawyersCount: number;
        totalRating: number;
        ratedLawyers: number;
      }
    >();

    allLawyers.forEach((lawyer) => {
      lawyer.specializations.forEach((spec) => {
        const existing = specializationsMap.get(spec) || {
          lawyersCount: 0,
          totalRating: 0,
          ratedLawyers: 0,
        };
        existing.lawyersCount++;
        if (lawyer.reviewCount > 0) {
          existing.totalRating += Number(lawyer.ratingValue);
          existing.ratedLawyers++;
        }
        specializationsMap.set(spec, existing);
      });
    });

    const specializations = Array.from(specializationsMap.entries()).map(
      ([name, stats]) => ({
        name,
        lawyersCount: stats.lawyersCount,
        consultationsCount: 0, // TODO: Count from consultations
        averageRating:
          stats.ratedLawyers > 0
            ? Number((stats.totalRating / stats.ratedLawyers).toFixed(2))
            : 0,
        revenue: 0, // TODO: Calculate from payments
      }),
    );

    // Build satisfaction trend over last 6 months
    const months = eachMonthOfInterval({ start, end });
    const satisfactionTrend = await Promise.all(
      months.map(async (month) => {
        // For now, use current ratings as placeholder
        // TODO: Track rating history over time
        const lawyersWithRatings = await this.lawyerRepo
          .createQueryBuilder('lawyer')
          .select('AVG(lawyer.ratingValue)', 'avg')
          .addSelect('SUM(lawyer.reviewCount)', 'total')
          .where('lawyer.status = :status', { status: LawyerStatus.Active })
          .andWhere('lawyer.reviewCount > 0')
          .getRawOne();

        return {
          date: format(month, 'yyyy-MM'),
          averageRating: parseFloat(lawyersWithRatings?.avg || '0'),
          reviewsCount: parseInt(lawyersWithRatings?.total || '0', 10),
        };
      }),
    );

    return {
      overview: {
        totalLawyers,
        activeLawyers,
        averageRating: Number(averageRating.toFixed(2)),
        averageResponseTime,
        averageConsultations,
        completionRate,
      },
      topPerformers: topPerformersData,
      specializations,
      satisfactionTrend,
    };
  }
}
