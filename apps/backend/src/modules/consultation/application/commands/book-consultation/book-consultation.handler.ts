import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Injectable, BadRequestException } from '@nestjs/common';
import { BookConsultationCommand } from './book-consultation.command';
import { IConsultationRepository } from '../../../domain/repositories/consultation.repository';
import { Consultation } from '../../../domain/entities/consultation.entity';
import { v4 as uuidv4 } from 'uuid';

/**
 * Book Consultation Command Handler
 *
 * Handles the booking of a new consultation
 */
@Injectable()
@CommandHandler(BookConsultationCommand)
export class BookConsultationHandler
  implements ICommandHandler<BookConsultationCommand>
{
  constructor(
    private readonly consultationRepository: IConsultationRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: BookConsultationCommand): Promise<any> {
    const {
      clientId,
      lawyerId,
      type,
      description,
      scheduledStart,
      scheduledEnd,
    } = command;

    // Check if client already has an active consultation
    const hasActive =
      await this.consultationRepository.hasActiveConsultationForClient(
        clientId,
      );
    if (hasActive) {
      throw new BadRequestException(
        'У вас уже есть активная консультация',
      );
    }

    // Check if lawyer has an active consultation
    const lawyerHasActive =
      await this.consultationRepository.hasActiveConsultation(lawyerId);
    if (lawyerHasActive) {
      throw new BadRequestException(
        'Юрист занят другой консультацией',
      );
    }

    // TODO: Get lawyer's hourly rate from Lawyer aggregate
    // For now, use a fixed price
    const price = 3000; // ₽

    // Create consultation
    const consultationId = uuidv4();
    const consultationResult = Consultation.create(
      consultationId,
      clientId,
      lawyerId,
      type,
      description,
      price,
      scheduledStart,
      scheduledEnd,
    );

    if (consultationResult.isFailure) {
      throw new BadRequestException(consultationResult.error);
    }

    const consultation = consultationResult.value;

    // Save consultation
    await this.consultationRepository.save(consultation);

    // Publish domain events
    consultation.domainEvents.forEach((event) => this.eventBus.publish(event));
    consultation.clearDomainEvents();

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
      createdAt: consultation.createdAt,
    };
  }
}
