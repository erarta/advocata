import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { GetConsultationByIdQuery } from './get-consultation-by-id.query';
import { IConsultationRepository } from '../../../domain/repositories/consultation.repository';

/**
 * Get Consultation By ID Query Handler
 *
 * Retrieves a single consultation by ID
 */
@Injectable()
@QueryHandler(GetConsultationByIdQuery)
export class GetConsultationByIdHandler
  implements IQueryHandler<GetConsultationByIdQuery>
{
  constructor(
    private readonly consultationRepository: IConsultationRepository,
  ) {}

  async execute(query: GetConsultationByIdQuery): Promise<any> {
    const { consultationId, userId } = query;

    const consultation =
      await this.consultationRepository.findById(consultationId);

    if (!consultation) {
      throw new NotFoundException('Консультация не найдена');
    }

    // Verify user has access to this consultation
    if (
      consultation.clientId !== userId &&
      consultation.lawyerId !== userId
    ) {
      throw new ForbiddenException(
        'У вас нет доступа к этой консультации',
      );
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
      cancelledAt: consultation.cancelledAt,
      rating: consultation.rating,
      review: consultation.review,
      cancellationReason: consultation.cancellationReason,
      actualDuration: consultation.actualDuration,
      createdAt: consultation.createdAt,
      updatedAt: consultation.updatedAt,
    };
  }
}
