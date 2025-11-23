import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetLiveConsultationsQuery } from './get-live-consultations.query';
import { ConsultationOrmEntity } from '../../../../../consultation/infrastructure/persistence/consultation.orm-entity';
import { UserOrmEntity } from '../../../../../identity/infrastructure/persistence/user.orm-entity';
import { LawyerOrmEntity } from '../../../../../lawyer/infrastructure/persistence/lawyer.orm-entity';

interface LiveConsultation {
  id: string;
  type: string;
  client: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  lawyer: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  startTime: Date;
  duration: number; // minutes
  expectedEndTime?: Date;
}

@QueryHandler(GetLiveConsultationsQuery)
export class GetLiveConsultationsHandler
  implements IQueryHandler<GetLiveConsultationsQuery>
{
  constructor(
    @InjectRepository(ConsultationOrmEntity)
    private readonly consultationRepository: Repository<ConsultationOrmEntity>,
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
    @InjectRepository(LawyerOrmEntity)
    private readonly lawyerRepository: Repository<LawyerOrmEntity>,
  ) {}

  async execute(query: GetLiveConsultationsQuery): Promise<LiveConsultation[]> {
    const queryBuilder =
      this.consultationRepository.createQueryBuilder('consultation');

    // Get all consultations that are currently in progress
    queryBuilder
      .leftJoin(UserOrmEntity, 'client', 'client.id = consultation.clientId')
      .leftJoin(LawyerOrmEntity, 'lawyer', 'lawyer.id = consultation.lawyerId')
      .select([
        'consultation.id',
        'consultation.type',
        'consultation.startedAt',
        'consultation.scheduledEnd',
        'client.id as "client_id"',
        'client.firstName as "client_firstName"',
        'client.lastName as "client_lastName"',
        'client.avatarUrl as "client_avatarUrl"',
        'lawyer.id as "lawyer_id"',
        'lawyer.firstName as "lawyer_firstName"',
        'lawyer.lastName as "lawyer_lastName"',
        'lawyer.avatarUrl as "lawyer_avatarUrl"',
      ])
      .where('consultation.status = :status', { status: 'in_progress' })
      .andWhere('consultation.startedAt IS NOT NULL')
      .orderBy('consultation.startedAt', 'ASC'); // Longest running first

    const rawResults = await queryBuilder.getRawMany();

    // Transform results
    const now = Date.now();
    return rawResults.map((row) => {
      const startTime = new Date(row.consultation_startedAt);
      const duration = Math.round((now - startTime.getTime()) / 60000); // minutes

      return {
        id: row.consultation_id,
        type: row.consultation_type,
        client: {
          id: row.client_id,
          name: `${row.client_firstName} ${row.client_lastName}`.trim(),
          avatarUrl: row.client_avatarUrl,
        },
        lawyer: {
          id: row.lawyer_id,
          name: `${row.lawyer_firstName} ${row.lawyer_lastName}`.trim(),
          avatarUrl: row.lawyer_avatarUrl,
        },
        startTime,
        duration,
        expectedEndTime: row.consultation_scheduledEnd
          ? new Date(row.consultation_scheduledEnd)
          : undefined,
      };
    });
  }
}
