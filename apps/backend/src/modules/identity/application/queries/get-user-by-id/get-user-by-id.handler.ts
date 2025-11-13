import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetUserByIdQuery } from './get-user-by-id.query';
import { UserDto } from './user.dto';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { Result } from '@shared/domain/result';

/**
 * GetUserByIdQueryHandler
 *
 * Retrieves user by ID
 */
@QueryHandler(GetUserByIdQuery)
export class GetUserByIdQueryHandler
  implements IQueryHandler<GetUserByIdQuery, Result<UserDto>>
{
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: GetUserByIdQuery): Promise<Result<UserDto>> {
    const user = await this.userRepository.findById(query.userId);

    if (!user) {
      return Result.fail('User not found');
    }

    const userDto: UserDto = {
      id: user.id,
      phoneNumber: user.phoneNumber.value,
      email: user.email?.value,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
      isPhoneVerified: user.isPhoneVerified,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return Result.ok(userDto);
  }
}
