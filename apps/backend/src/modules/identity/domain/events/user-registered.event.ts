import { BaseDomainEvent } from '@shared/domain/domain-event';
import { UserRole } from '../enums/user-role.enum';

/**
 * UserRegisteredEvent
 *
 * Raised when a new user registers on the platform
 */
export class UserRegisteredEvent extends BaseDomainEvent {
  constructor(
    public readonly userId: string,
    public readonly phoneNumber: string,
    public readonly role: UserRole,
  ) {
    super(userId);
  }
}
