import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { GetConsultationQuery } from './get-consultation.query';
import { ConsultationOrmEntity } from '../../../../../consultation/infrastructure/persistence/consultation.orm-entity';
import { UserOrmEntity } from '../../../../../identity/infrastructure/persistence/user.orm-entity';
import { LawyerOrmEntity } from '../../../../../lawyer/infrastructure/persistence/lawyer.orm-entity';

interface ConsultationDetail {
  id: string;
  type: string;
  status: string;
  description: string;
  price: number;
  currency: string;
  scheduledStart: Date | null;
  scheduledEnd: Date | null;
  confirmedAt: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  rating: number | null;
  review: string | null;
  cancellationReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  duration?: number;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    avatarUrl?: string;
  };
  lawyer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    avatarUrl?: string;
    specializations?: string[];
  };
}

@QueryHandler(GetConsultationQuery)
export class GetConsultationHandler
  implements IQueryHandler<GetConsultationQuery>
{
  constructor(
    @InjectRepository(ConsultationOrmEntity)
    private readonly consultationRepository: Repository<ConsultationOrmEntity>,
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
    @InjectRepository(LawyerOrmEntity)
    private readonly lawyerRepository: Repository<LawyerOrmEntity>,
  ) {}

  async execute(query: GetConsultationQuery): Promise<ConsultationDetail> {
    const { consultationId } = query;

    // Find consultation
    const consultation = await this.consultationRepository.findOne({
      where: { id: consultationId },
    });

    if (!consultation) {
      throw new NotFoundException(
        `Consultation with ID ${consultationId} not found`,
      );
    }

    // Load client details
    const client = await this.userRepository.findOne({
      where: { id: consultation.clientId },
    });

    if (!client) {
      throw new NotFoundException(
        `Client with ID ${consultation.clientId} not found`,
      );
    }

    // Load lawyer details
    const lawyer = await this.lawyerRepository.findOne({
      where: { id: consultation.lawyerId },
    });

    if (!lawyer) {
      throw new NotFoundException(
        `Lawyer with ID ${consultation.lawyerId} not found`,
      );
    }

    // Calculate duration if applicable
    let duration: number | undefined;
    if (consultation.startedAt && consultation.completedAt) {
      const start = new Date(consultation.startedAt).getTime();
      const end = new Date(consultation.completedAt).getTime();
      duration = Math.round((end - start) / 60000); // minutes
    } else if (consultation.startedAt && consultation.status === 'in_progress') {
      const start = new Date(consultation.startedAt).getTime();
      const now = Date.now();
      duration = Math.round((now - start) / 60000); // minutes
    }

    return {
      id: consultation.id,
      type: consultation.type,
      status: consultation.status,
      description: consultation.description,
      price: Number(consultation.price),
      currency: consultation.currency,
      scheduledStart: consultation.scheduledStart,
      scheduledEnd: consultation.scheduledEnd,
      confirmedAt: consultation.confirmedAt,
      startedAt: consultation.startedAt,
      completedAt: consultation.completedAt,
      cancelledAt: consultation.cancelledAt,
      rating: consultation.rating,
      review: consultation.review,
      cancellationReason: consultation.cancellationReason,
      createdAt: consultation.createdAt,
      updatedAt: consultation.updatedAt,
      duration,
      client: {
        id: client.id,
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phoneNumber: client.phoneNumber,
        avatarUrl: client.avatarUrl,
      },
      lawyer: {
        id: lawyer.id,
        firstName: lawyer.firstName,
        lastName: lawyer.lastName,
        email: lawyer.email,
        phoneNumber: lawyer.phoneNumber,
        avatarUrl: lawyer.avatarUrl,
        specializations: lawyer.specializations,
      },
    };
  }
}
