import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { GetLawyerConsultationsQuery } from './get-lawyer-consultations.query';
import { IConsultationRepository } from '../../../domain/repositories/consultation.repository';

/**
 * Get Lawyer Consultations Query Handler
 *
 * Retrieves all consultations for a lawyer
 */
@Injectable()
@QueryHandler(GetLawyerConsultationsQuery)
export class GetLawyerConsultationsHandler
  implements IQueryHandler<GetLawyerConsultationsQuery>
{
  constructor(
    private readonly consultationRepository: IConsultationRepository,
  ) {}

  async execute(query: GetLawyerConsultationsQuery): Promise<any> {
    const { lawyerId, status, limit = 50, offset = 0 } = query;

    const result = await this.consultationRepository.findByLawyerId(
      lawyerId,
      status,
      limit,
      offset,
    );

    return {
      items: result.items.map((consultation) => ({
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
        cancelledAt: consultation.cancelledAt,
        rating: consultation.rating,
        review: consultation.review,
        cancellationReason: consultation.cancellationReason,
        createdAt: consultation.createdAt,
        updatedAt: consultation.updatedAt,
      })),
      total: result.total,
      limit,
      offset,
    };
  }
}
