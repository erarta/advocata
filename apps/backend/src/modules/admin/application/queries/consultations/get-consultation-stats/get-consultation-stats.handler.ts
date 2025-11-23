import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetConsultationStatsQuery } from './get-consultation-stats.query';
import { ConsultationOrmEntity } from '../../../../../consultation/infrastructure/persistence/consultation.orm-entity';
import { EmergencyCallOrmEntity } from '../../../../../emergency-call/infrastructure/persistence/emergency-call.orm-entity';

interface ConsultationStats {
  total: number;
  byStatus: {
    scheduled: number;
    in_progress: number;
    completed: number;
    cancelled: number;
    disputed: number;
  };
  byType: {
    chat: number;
    video: number;
    voice: number;
    in_person: number;
    emergency: number;
  };
  completionRate: number; // %
  averageDuration: number; // minutes
  averagePrice: number; // RUB
  totalRevenue: number; // RUB
  disputeRate: number; // %
  emergencyResponseTime: number; // avg minutes
}

@QueryHandler(GetConsultationStatsQuery)
export class GetConsultationStatsHandler
  implements IQueryHandler<GetConsultationStatsQuery>
{
  constructor(
    @InjectRepository(ConsultationOrmEntity)
    private readonly consultationRepository: Repository<ConsultationOrmEntity>,
    @InjectRepository(EmergencyCallOrmEntity)
    private readonly emergencyCallRepository: Repository<EmergencyCallOrmEntity>,
  ) {}

  async execute(query: GetConsultationStatsQuery): Promise<ConsultationStats> {
    const { dateFrom, dateTo } = query.dto;

    // Build base query with date filters
    const queryBuilder =
      this.consultationRepository.createQueryBuilder('consultation');

    if (dateFrom) {
      queryBuilder.andWhere('consultation.createdAt >= :dateFrom', {
        dateFrom,
      });
    }

    if (dateTo) {
      queryBuilder.andWhere('consultation.createdAt <= :dateTo', { dateTo });
    }

    // Get all consultations for analysis
    const consultations = await queryBuilder.getMany();

    const total = consultations.length;

    // Calculate by status
    const byStatus = {
      scheduled: consultations.filter((c) => c.status === 'scheduled').length,
      in_progress: consultations.filter((c) => c.status === 'in_progress')
        .length,
      completed: consultations.filter((c) => c.status === 'completed').length,
      cancelled: consultations.filter((c) => c.status === 'cancelled').length,
      disputed: consultations.filter(
        (c) => c.status === 'disputed' || c.cancellationReason !== null,
      ).length,
    };

    // Calculate by type
    const byType = {
      chat: consultations.filter((c) => c.type === 'chat').length,
      video: consultations.filter((c) => c.type === 'video').length,
      voice: consultations.filter((c) => c.type === 'voice').length,
      in_person: consultations.filter((c) => c.type === 'in_person').length,
      emergency: consultations.filter((c) => c.type === 'emergency').length,
    };

    // Calculate completion rate
    const completedCount = byStatus.completed;
    const completionRate =
      total > 0 ? Math.round((completedCount / total) * 100) : 0;

    // Calculate average duration (for completed consultations)
    const completedWithDuration = consultations.filter(
      (c) => c.status === 'completed' && c.startedAt && c.completedAt,
    );

    let averageDuration = 0;
    if (completedWithDuration.length > 0) {
      const totalDuration = completedWithDuration.reduce((sum, c) => {
        const start = new Date(c.startedAt!).getTime();
        const end = new Date(c.completedAt!).getTime();
        return sum + (end - start) / 60000; // minutes
      }, 0);
      averageDuration = Math.round(totalDuration / completedWithDuration.length);
    }

    // Calculate average price
    let averagePrice = 0;
    if (total > 0) {
      const totalPrice = consultations.reduce(
        (sum, c) => sum + Number(c.price),
        0,
      );
      averagePrice = Math.round((totalPrice / total) * 100) / 100;
    }

    // Calculate total revenue (from completed consultations)
    const totalRevenue = consultations
      .filter((c) => c.status === 'completed')
      .reduce((sum, c) => sum + Number(c.price), 0);

    // Calculate dispute rate
    const disputeRate =
      total > 0 ? Math.round((byStatus.disputed / total) * 100) : 0;

    // Calculate emergency response time
    let emergencyResponseTime = 0;
    const emergencyQuery =
      this.emergencyCallRepository.createQueryBuilder('ec');

    if (dateFrom) {
      emergencyQuery.andWhere('ec.created_at >= :dateFrom', { dateFrom });
    }

    if (dateTo) {
      emergencyQuery.andWhere('ec.created_at <= :dateTo', { dateTo });
    }

    emergencyQuery.andWhere('ec.accepted_at IS NOT NULL');

    const emergencyCalls = await emergencyQuery.getMany();

    if (emergencyCalls.length > 0) {
      const totalResponseTime = emergencyCalls.reduce((sum, ec) => {
        if (ec.acceptedAt && ec.createdAt) {
          const created = new Date(ec.createdAt).getTime();
          const accepted = new Date(ec.acceptedAt).getTime();
          return sum + (accepted - created) / 60000; // minutes
        }
        return sum;
      }, 0);
      emergencyResponseTime = Math.round(
        totalResponseTime / emergencyCalls.length,
      );
    }

    return {
      total,
      byStatus,
      byType,
      completionRate,
      averageDuration,
      averagePrice,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      disputeRate,
      emergencyResponseTime,
    };
  }
}
