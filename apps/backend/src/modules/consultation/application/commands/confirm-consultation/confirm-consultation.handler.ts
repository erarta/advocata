import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ConfirmConsultationCommand } from './confirm-consultation.command';
import { IConsultationRepository } from '../../../domain/repositories/consultation.repository';

/**
 * Confirm Consultation Command Handler
 *
 * Handles lawyer confirming a consultation
 */
@Injectable()
@CommandHandler(ConfirmConsultationCommand)
export class ConfirmConsultationHandler
  implements ICommandHandler<ConfirmConsultationCommand>
{
  constructor(
    private readonly consultationRepository: IConsultationRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: ConfirmConsultationCommand): Promise<any> {
    const { consultationId, lawyerId } = command;

    // Find consultation
    const consultation =
      await this.consultationRepository.findById(consultationId);
    if (!consultation) {
      throw new NotFoundException('Консультация не найдена');
    }

    // Check if lawyer is the assigned lawyer
    if (consultation.lawyerId !== lawyerId) {
      throw new ForbiddenException(
        'Вы не можете подтвердить эту консультацию',
      );
    }

    // Confirm consultation
    const confirmResult = consultation.confirm();
    if (confirmResult.isFailure) {
      throw new BadRequestException(confirmResult.error);
    }

    // Save consultation
    await this.consultationRepository.save(consultation);

    // Publish domain events
    consultation.domainEvents.forEach((event) => this.eventBus.publish(event));
    consultation.clearDomainEvents();

    return {
      id: consultation.id,
      status: consultation.status,
      confirmedAt: consultation.confirmedAt,
    };
  }
}
