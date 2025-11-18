import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { GetUserConsultationsQuery } from './get-user-consultations.query';
import { IConsultationRepository } from '../../../domain/repositories/consultation.repository';

/**
 * Get User Consultations Query Handler
 *
 * Retrieves all consultations for a client
 */
@Injectable()
@QueryHandler(GetUserConsultationsQuery)
export class GetUserConsultationsHandler
  implements IQueryHandler<GetUserConsultationsQuery>
{
  constructor(
    private readonly consultationRepository: IConsultationRepository,
  ) {}

  async execute(query: GetUserConsultationsQuery): Promise<any> {
    const { clientId, status, limit = 50, offset = 0 } = query;

    const result = await this.consultationRepository.findByClientId(
      clientId,
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
