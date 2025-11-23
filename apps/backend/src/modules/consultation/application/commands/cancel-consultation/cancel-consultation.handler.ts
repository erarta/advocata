import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CancelConsultationCommand } from './cancel-consultation.command';
import { IConsultationRepository } from '../../../domain/repositories/consultation.repository';

/**
 * Cancel Consultation Command Handler
 *
 * Handles cancellation of a consultation
 */
@Injectable()
@CommandHandler(CancelConsultationCommand)
export class CancelConsultationHandler
  implements ICommandHandler<CancelConsultationCommand>
{
  constructor(
    private readonly consultationRepository: IConsultationRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CancelConsultationCommand): Promise<any> {
    const { consultationId, userId, cancellationReason } = command;

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
        'Вы не можете отменить эту консультацию',
      );
    }

    // Cancel consultation
    const cancelResult = consultation.cancel(cancellationReason);
    if (cancelResult.isFailure) {
      throw new BadRequestException(cancelResult.error);
    }

    // Save consultation
    await this.consultationRepository.save(consultation);

    // Publish domain events
    consultation.domainEvents.forEach((event) => this.eventBus.publish(event));
    consultation.clearDomainEvents();

    return {
      id: consultation.id,
      status: consultation.status,
      cancelledAt: consultation.cancelledAt,
      cancellationReason: consultation.cancellationReason,
    };
  }
}
