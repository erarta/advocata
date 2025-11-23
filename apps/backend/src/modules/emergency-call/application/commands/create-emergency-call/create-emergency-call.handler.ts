import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateEmergencyCallCommand } from './create-emergency-call.command';
import { IEmergencyCallRepository } from '../../../domain/repositories/emergency-call.repository.interface';
import { EmergencyCall } from '../../../domain/entities/emergency-call.entity';
import { Location } from '../../../domain/value-objects/location.vo';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create Emergency Call Command Handler
 * Handles the creation of a new emergency call
 */
@CommandHandler(CreateEmergencyCallCommand)
export class CreateEmergencyCallHandler
  implements ICommandHandler<CreateEmergencyCallCommand, EmergencyCall>
{
  constructor(
    @Inject('IEmergencyCallRepository')
    private readonly repository: IEmergencyCallRepository,
  ) {}

  async execute(command: CreateEmergencyCallCommand): Promise<EmergencyCall> {
    // Create location value object
    const location = Location.create(command.latitude, command.longitude);

    // Create emergency call entity
    const emergencyCall = EmergencyCall.create(
      uuidv4(),
      command.userId,
      location,
      command.address,
      command.notes || null,
    );

    // Save to repository
    const savedCall = await this.repository.create(emergencyCall);

    // TODO: Emit domain event for notification service
    // TODO: Notify nearby lawyers via WebSocket

    return savedCall;
  }
}
