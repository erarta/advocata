import { BaseDomainEvent } from '@shared/domain/domain-event';

/**
 * UserSuspendedEvent
 *
 * Raised when a user account is suspended
 */
export class UserSuspendedEvent extends BaseDomainEvent {
  constructor(
    public readonly userId: string,
    public readonly reason: string,
  ) {
    super(userId);
  }
}
