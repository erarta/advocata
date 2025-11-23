import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetLawyerPerformanceQuery } from './get-lawyer-performance.query';
import { LawyerOrmEntity } from '../../../../../lawyer/infrastructure/persistence/lawyer.orm-entity';
import { UserOrmEntity } from '../../../../../identity/infrastructure/persistence/user.orm-entity';
import { LawyerStatus } from '../../../../../lawyer/domain/enums/lawyer-status.enum';

interface LawyerPerformance {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  rating: number;
  reviewCount: number;
  totalConsultations: number; // TODO: From consultations table
  totalEarnings: number; // TODO: From payments table
  averageResponseTime: number; // TODO: From consultations table
}

interface PerformanceMetrics {
  averageRating: number;
  averageConsultations: number;
  averageResponseTime: number; // in minutes
}

interface PerformanceResponse {
  topPerformers: LawyerPerformance[];
  underperformers: LawyerPerformance[];
  metrics: PerformanceMetrics;
}

@QueryHandler(GetLawyerPerformanceQuery)
export class GetLawyerPerformanceHandler
  implements IQueryHandler<GetLawyerPerformanceQuery>
{
  constructor(
    @InjectRepository(LawyerOrmEntity)
    private readonly lawyerRepository: Repository<LawyerOrmEntity>,
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
  ) {}

  async execute(
    query: GetLawyerPerformanceQuery,
  ): Promise<PerformanceResponse> {
    const { page = 1, limit = 10, sortBy = 'rating' } = query.dto;

    // Get top performers (rating >= 4.5, or high review count)
    const topPerformersQuery = this.lawyerRepository
      .createQueryBuilder('lawyer')
      .where('lawyer.status = :status', { status: LawyerStatus.Active })
      .andWhere('lawyer.reviewCount > 0');

    if (sortBy === 'rating') {
      topPerformersQuery.orderBy('lawyer.ratingValue', 'DESC');
    } else {
      topPerformersQuery.orderBy('lawyer.reviewCount', 'DESC');
    }

    topPerformersQuery.take(limit);

    const topPerformersRaw = await topPerformersQuery.getMany();

    // Get underperformers (rating < 3.5 OR low consultation count)
    const underperformersQuery = this.lawyerRepository
      .createQueryBuilder('lawyer')
      .where('lawyer.status = :status', { status: LawyerStatus.Active })
      .andWhere('lawyer.reviewCount > 0')
      .andWhere('lawyer.ratingValue < 3.5')
      .orderBy('lawyer.ratingValue', 'ASC')
      .take(limit);

    const underperformersRaw = await underperformersQuery.getMany();

    // Fetch user data for all lawyers
    const topPerformers = await Promise.all(
      topPerformersRaw.map(async (lawyer) => {
        const user = await this.userRepository.findOne({
          where: { id: lawyer.userId },
        });
        return this.mapToPerformance(lawyer, user);
      }),
    );

    const underperformers = await Promise.all(
      underperformersRaw.map(async (lawyer) => {
        const user = await this.userRepository.findOne({
          where: { id: lawyer.userId },
        });
        return this.mapToPerformance(lawyer, user);
      }),
    );

    // Calculate average metrics
    const avgRatingResult = await this.lawyerRepository
      .createQueryBuilder('lawyer')
      .select('AVG(lawyer.ratingValue)', 'avg')
      .where('lawyer.reviewCount > 0')
      .getRawOne();

    const averageRating = avgRatingResult?.avg
      ? parseFloat(parseFloat(avgRatingResult.avg).toFixed(2))
      : 0;

    // TODO: Calculate from consultations table when available
    const metrics: PerformanceMetrics = {
      averageRating,
      averageConsultations: 0,
      averageResponseTime: 0,
    };

    return {
      topPerformers,
      underperformers,
      metrics,
    };
  }

  private mapToPerformance(
    lawyer: LawyerOrmEntity,
    user?: UserOrmEntity,
  ): LawyerPerformance {
    return {
      id: lawyer.id,
      userId: lawyer.userId,
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.email,
      rating: lawyer.ratingValue,
      reviewCount: lawyer.reviewCount,
      totalConsultations: 0, // TODO: From consultations
      totalEarnings: 0, // TODO: From payments
      averageResponseTime: 0, // TODO: From consultations
    };
  }
}
