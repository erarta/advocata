import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CompleteConsultationCommand } from './complete-consultation.command';
import { IConsultationRepository } from '../../../domain/repositories/consultation.repository';

/**
 * Complete Consultation Command Handler
 *
 * Handles completing an active consultation
 */
@Injectable()
@CommandHandler(CompleteConsultationCommand)
export class CompleteConsultationHandler
  implements ICommandHandler<CompleteConsultationCommand>
{
  constructor(
    private readonly consultationRepository: IConsultationRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CompleteConsultationCommand): Promise<any> {
    const { consultationId, userId } = command;

    // Find consultation
    const consultation =
      await this.consultationRepository.findById(consultationId);
    if (!consultation) {
      throw new NotFoundException('Консультация не найдена');
    }

    // Check if user is participant
    if (
      consultation.clientId !== userId &&
      consultation.lawyerId !== userId
    ) {
      throw new ForbiddenException(
        'Вы не можете завершить эту консультацию',
      );
    }

    // Complete consultation
    const completeResult = consultation.complete();
    if (completeResult.isFailure) {
      throw new BadRequestException(completeResult.error);
    }

    // Save consultation
    await this.consultationRepository.save(consultation);

    // Publish domain events
    consultation.domainEvents.forEach((event) => this.eventBus.publish(event));
    consultation.clearDomainEvents();

    return {
      id: consultation.id,
      status: consultation.status,
      completedAt: consultation.completedAt,
      actualDuration: consultation.actualDuration,
    };
  }
}
