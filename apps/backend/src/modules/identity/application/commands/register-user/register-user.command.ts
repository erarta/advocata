import { UserRole } from '../../../domain/enums';

/**
 * RegisterUserCommand
 *
 * Command to register a new user in the system
 */
export class RegisterUserCommand {
  constructor(
    public readonly phoneNumber: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly role: UserRole,
  ) {}
}
