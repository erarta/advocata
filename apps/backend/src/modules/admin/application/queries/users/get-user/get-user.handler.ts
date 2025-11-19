import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetUserQuery } from './get-user.query';
import { UserOrmEntity } from '../../../../../identity/infrastructure/persistence/user.orm-entity';

interface UserDetailResponse {
  id: string;
  phoneNumber: string;
  email: string | null;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  status: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // TODO: Add subscription info when subscription module is integrated
  // subscription?: SubscriptionInfo;
  // TODO: Add activity stats when activity logging is implemented
  // stats?: {
  //   totalConsultations: number;
  //   completedConsultations: number;
  //   cancelledConsultations: number;
  // };
}

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
  ) {}

  async execute(query: GetUserQuery): Promise<UserDetailResponse> {
    const user = await this.userRepository.findOne({
      where: { id: query.userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${query.userId} not found`);
    }

    return {
      id: user.id,
      phoneNumber: user.phoneNumber,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
      role: user.role,
      status: user.status,
      isPhoneVerified: user.isPhoneVerified,
      isEmailVerified: user.isEmailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
