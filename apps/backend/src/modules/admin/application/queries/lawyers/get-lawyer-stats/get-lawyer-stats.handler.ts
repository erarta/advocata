import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetLawyerStatsQuery } from './get-lawyer-stats.query';
import { LawyerOrmEntity } from '../../../../../lawyer/infrastructure/persistence/lawyer.orm-entity';
import { LawyerStatus } from '../../../../../lawyer/domain/enums/lawyer-status.enum';
import { VerificationStatus } from '../../../../../lawyer/domain/enums/verification-status.enum';

interface LawyerStatsResponse {
  totalLawyers: number;
  activeLawyers: number;
  inactiveLawyers: number;
  pendingVerification: number;
  suspended: number;
  banned: number;
  averageRating: number;
  totalConsultations: number; // TODO: Calculate from consultations table
  newLawyersThisMonth: number;
}

@QueryHandler(GetLawyerStatsQuery)
export class GetLawyerStatsHandler
  implements IQueryHandler<GetLawyerStatsQuery>
{
  constructor(
    @InjectRepository(LawyerOrmEntity)
    private readonly lawyerRepository: Repository<LawyerOrmEntity>,
  ) {}

  async execute(query: GetLawyerStatsQuery): Promise<LawyerStatsResponse> {
    // Get total lawyers
    const totalLawyers = await this.lawyerRepository.count();

    // Get active lawyers
    const activeLawyers = await this.lawyerRepository.count({
      where: { status: LawyerStatus.Active },
    });

    // Get inactive lawyers
    const inactiveLawyers = await this.lawyerRepository.count({
      where: { status: LawyerStatus.Inactive },
    });

    // Get pending verification
    const pendingVerification = await this.lawyerRepository.count({
      where: {
        verificationStatus: VerificationStatus.Pending,
      },
    });

    // Get suspended lawyers
    const suspended = await this.lawyerRepository.count({
      where: { status: LawyerStatus.Suspended },
    });

    // Get banned lawyers
    const banned = await this.lawyerRepository.count({
      where: { status: LawyerStatus.Banned },
    });

    // Calculate average rating
    const ratingResult = await this.lawyerRepository
      .createQueryBuilder('lawyer')
      .select('AVG(lawyer.ratingValue)', 'averageRating')
      .where('lawyer.reviewCount > 0')
      .getRawOne();

    const averageRating = ratingResult?.averageRating
      ? parseFloat(parseFloat(ratingResult.averageRating).toFixed(2))
      : 0;

    // Get new lawyers this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newLawyersThisMonth = await this.lawyerRepository
      .createQueryBuilder('lawyer')
      .where('lawyer.createdAt >= :startOfMonth', { startOfMonth })
      .getCount();

    // TODO: Get total consultations from consultations table when available
    const totalConsultations = 0;

    return {
      totalLawyers,
      activeLawyers,
      inactiveLawyers,
      pendingVerification,
      suspended,
      banned,
      averageRating,
      totalConsultations,
      newLawyersThisMonth,
    };
  }
}
