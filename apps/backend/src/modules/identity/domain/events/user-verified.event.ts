import { BaseDomainEvent } from '@shared/domain/domain-event';

/**
 * UserVerifiedEvent
 *
 * Raised when a user successfully verifies their phone number
 */
export class UserVerifiedEvent extends BaseDomainEvent {
  constructor(
    public readonly userId: string,
    public readonly phoneNumber: string,
  ) {
    super(userId);
  }
}
