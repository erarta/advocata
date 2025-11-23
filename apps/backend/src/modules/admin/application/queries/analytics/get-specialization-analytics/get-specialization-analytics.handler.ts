import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetSpecializationAnalyticsQuery } from './get-specialization-analytics.query';
import { LawyerOrmEntity } from '../../../../../lawyer/infrastructure/persistence/lawyer.orm-entity';
import { LawyerStatus } from '../../../../../lawyer/domain/enums';

interface SpecializationAnalyticsResult {
  specializations: Array<{
    name: string;
    lawyersCount: number;
    consultationsCount: number;
    revenue: number;
    averageRating: number;
    averagePrice: number;
    demand: number;
  }>;
  trending: Array<{
    name: string;
    growthRate: number;
    consultationsChange: number;
  }>;
  gaps: Array<{
    name: string;
    lawyersCount: number;
    demandCount: number;
    opportunity: number;
  }>;
}

@QueryHandler(GetSpecializationAnalyticsQuery)
export class GetSpecializationAnalyticsHandler
  implements IQueryHandler<GetSpecializationAnalyticsQuery>
{
  constructor(
    @InjectRepository(LawyerOrmEntity)
    private readonly lawyerRepo: Repository<LawyerOrmEntity>,
    // TODO: Inject ConsultationRepository when available
    // TODO: Inject PaymentRepository when available
  ) {}

  async execute(
    query: GetSpecializationAnalyticsQuery,
  ): Promise<SpecializationAnalyticsResult> {
    // Get all active lawyers
    const allLawyers = await this.lawyerRepo.find({
      where: { status: LawyerStatus.Active },
    });

    // Build specialization statistics
    const specializationsMap = new Map<
      string,
      {
        lawyersCount: number;
        totalRating: number;
        ratedLawyers: number;
        totalHourlyRate: number;
        lawyersWithRate: number;
      }
    >();

    allLawyers.forEach((lawyer) => {
      lawyer.specializations.forEach((spec) => {
        const existing = specializationsMap.get(spec) || {
          lawyersCount: 0,
          totalRating: 0,
          ratedLawyers: 0,
          totalHourlyRate: 0,
          lawyersWithRate: 0,
        };

        existing.lawyersCount++;

        if (lawyer.reviewCount > 0) {
          existing.totalRating += Number(lawyer.ratingValue);
          existing.ratedLawyers++;
        }

        if (lawyer.hourlyRate) {
          existing.totalHourlyRate += lawyer.hourlyRate;
          existing.lawyersWithRate++;
        }

        specializationsMap.set(spec, existing);
      });
    });

    // Convert to array and calculate metrics
    const specializations = Array.from(specializationsMap.entries())
      .map(([name, stats]) => ({
        name,
        lawyersCount: stats.lawyersCount,
        consultationsCount: 0, // TODO: Count from consultations
        revenue: 0, // TODO: Calculate from payments
        averageRating:
          stats.ratedLawyers > 0
            ? Number((stats.totalRating / stats.ratedLawyers).toFixed(2))
            : 0,
        averagePrice:
          stats.lawyersWithRate > 0
            ? Number((stats.totalHourlyRate / stats.lawyersWithRate).toFixed(0))
            : 0,
        demand: 0, // TODO: consultationsCount / lawyersCount
      }))
      .sort((a, b) => b.lawyersCount - a.lawyersCount);

    // TODO: Calculate trending specializations based on consultation growth
    const trending = specializations.slice(0, 5).map((spec) => ({
      name: spec.name,
      growthRate: 0, // TODO: Calculate growth rate
      consultationsChange: 0, // TODO: Calculate change from previous period
    }));

    // Identify gaps (high demand, low supply)
    // TODO: Calculate actual demand from consultation requests
    const gaps = specializations
      .filter((spec) => spec.lawyersCount < 5) // Less than 5 lawyers
      .slice(0, 5)
      .map((spec) => ({
        name: spec.name,
        lawyersCount: spec.lawyersCount,
        demandCount: 0, // TODO: Count unmet consultation requests
        opportunity: 0, // TODO: Calculate potential revenue
      }));

    return {
      specializations,
      trending,
      gaps,
    };
  }
}
