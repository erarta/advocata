import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegisterUserCommand } from './register-user.command';
import { Result } from '@shared/domain/result';
import { User } from '../../../domain/entities';
import { PhoneNumber } from '../../../domain/value-objects';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { Inject } from '@nestjs/common';

export type RegisterUserResult = Result<{
  userId: string;
  phoneNumber: string;
}>;

/**
 * RegisterUserCommandHandler
 *
 * Handles user registration business logic
 */
@CommandHandler(RegisterUserCommand)
export class RegisterUserCommandHandler
  implements ICommandHandler<RegisterUserCommand, RegisterUserResult>
{
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: RegisterUserCommand): Promise<RegisterUserResult> {
    // 1. Validate and create PhoneNumber value object
    const phoneNumberOrError = PhoneNumber.create(command.phoneNumber);
    if (phoneNumberOrError.isFailure) {
      return Result.fail(phoneNumberOrError.error);
    }
    const phoneNumber = phoneNumberOrError.value;

    // 2. Check if user already exists
    const existingUser = await this.userRepository.findByPhoneNumber(
      phoneNumber.value,
    );
    if (existingUser) {
      return Result.fail('User with this phone number already exists');
    }

    // 3. Generate ID
    const userId = await this.userRepository.nextId();

    // 4. Create User entity
    const userOrError = User.create(
      userId,
      phoneNumber,
      command.firstName,
      command.lastName,
      command.role,
    );

    if (userOrError.isFailure) {
      return Result.fail(userOrError.error);
    }

    const user = userOrError.value;

    // 5. Save user
    await this.userRepository.save(user);

    // 6. Return success result
    return Result.ok({
      userId: user.id,
      phoneNumber: user.phoneNumber.value,
    });
  }
}
