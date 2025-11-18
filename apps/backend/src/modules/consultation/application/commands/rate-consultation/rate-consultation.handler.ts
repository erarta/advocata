import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { RateConsultationCommand } from './rate-consultation.command';
import { IConsultationRepository } from '../../../domain/repositories/consultation.repository';

/**
 * Rate Consultation Command Handler
 *
 * Handles rating of a completed consultation
 */
@Injectable()
@CommandHandler(RateConsultationCommand)
export class RateConsultationHandler
  implements ICommandHandler<RateConsultationCommand>
{
  constructor(
    private readonly consultationRepository: IConsultationRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RateConsultationCommand): Promise<any> {
    const { consultationId, clientId, rating, review } = command;

    // Find consultation
    const consultation =
      await this.consultationRepository.findById(consultationId);
    if (!consultation) {
      throw new NotFoundException('Консультация не найдена');
    }

    // Check if user is the client
    if (consultation.clientId !== clientId) {
      throw new ForbiddenException(
        'Только клиент может оценить консультацию',
      );
    }

    // Rate consultation
    const rateResult = consultation.rate(rating, review);
    if (rateResult.isFailure) {
      throw new BadRequestException(rateResult.error);
    }

    // Save consultation
    await this.consultationRepository.save(consultation);

    // Publish domain events (including ConsultationRatedEvent)
    consultation.domainEvents.forEach((event) => this.eventBus.publish(event));
    consultation.clearDomainEvents();

    return {
      id: consultation.id,
      rating: consultation.rating,
      review: consultation.review,
    };
  }
}
