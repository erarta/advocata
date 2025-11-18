import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { StartConsultationCommand } from './start-consultation.command';
import { IConsultationRepository } from '../../../domain/repositories/consultation.repository';

/**
 * Start Consultation Command Handler
 *
 * Handles starting a confirmed consultation
 */
@Injectable()
@CommandHandler(StartConsultationCommand)
export class StartConsultationHandler
  implements ICommandHandler<StartConsultationCommand>
{
  constructor(
    private readonly consultationRepository: IConsultationRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: StartConsultationCommand): Promise<any> {
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
        'Вы не можете начать эту консультацию',
      );
    }

    // Start consultation
    const startResult = consultation.start();
    if (startResult.isFailure) {
      throw new BadRequestException(startResult.error);
    }

    // Save consultation
    await this.consultationRepository.save(consultation);

    // Publish domain events
    consultation.domainEvents.forEach((event) => this.eventBus.publish(event));
    consultation.clearDomainEvents();

    return {
      id: consultation.id,
      status: consultation.status,
      startedAt: consultation.startedAt,
    };
  }
}
