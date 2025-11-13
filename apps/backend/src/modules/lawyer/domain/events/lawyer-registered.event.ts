import { BaseDomainEvent } from '@shared/domain/domain-event';
import { SpecializationType } from '../enums';

/**
 * LawyerRegisteredEvent
 *
 * Raised when a new lawyer registers on the platform
 */
export class LawyerRegisteredEvent extends BaseDomainEvent {
  constructor(
    public readonly lawyerId: string,
    public readonly userId: string,
    public readonly specializations: SpecializationType[],
  ) {
    super(lawyerId);
  }
}
