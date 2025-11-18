import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { GetActiveConsultationQuery } from './get-active-consultation.query';
import { IConsultationRepository } from '../../../domain/repositories/consultation.repository';

/**
 * Get Active Consultation Query Handler
 *
 * Retrieves the active consultation for a user (client or lawyer)
 */
@Injectable()
@QueryHandler(GetActiveConsultationQuery)
export class GetActiveConsultationHandler
  implements IQueryHandler<GetActiveConsultationQuery>
{
  constructor(
    private readonly consultationRepository: IConsultationRepository,
  ) {}

  async execute(query: GetActiveConsultationQuery): Promise<any> {
    const { userId, isLawyer } = query;

    const consultation = isLawyer
      ? await this.consultationRepository.findActiveByLawyerId(userId)
      : await this.consultationRepository.findActiveByClientId(userId);

    if (!consultation) {
      return null;
    }

    return {
      id: consultation.id,
      clientId: consultation.clientId,
      lawyerId: consultation.lawyerId,
      type: consultation.type,
      status: consultation.status,
      description: consultation.description,
      price: consultation.price,
      currency: consultation.currency,
      scheduledStart: consultation.scheduledStart,
      scheduledEnd: consultation.scheduledEnd,
      confirmedAt: consultation.confirmedAt,
      startedAt: consultation.startedAt,
      completedAt: consultation.completedAt,
      createdAt: consultation.createdAt,
      updatedAt: consultation.updatedAt,
    };
  }
}
