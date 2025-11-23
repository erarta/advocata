import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetUserActivityQuery } from './get-user-activity.query';
import { UserOrmEntity } from '../../../../../identity/infrastructure/persistence/user.orm-entity';

interface ActivityEvent {
  type: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface UserActivityResponse {
  userId: string;
  activities: ActivityEvent[];
  total: number;
}

@QueryHandler(GetUserActivityQuery)
export class GetUserActivityHandler
  implements IQueryHandler<GetUserActivityQuery>
{
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
  ) {}

  async execute(query: GetUserActivityQuery): Promise<UserActivityResponse> {
    const { userId, limit = 50 } = query;

    // Verify user exists
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // TODO: Implement actual activity logging system
    // For now, return basic activities based on user data
    const activities: ActivityEvent[] = [];

    // Add registration activity
    activities.push({
      type: 'USER_REGISTERED',
      description: 'User account created',
      timestamp: user.createdAt,
      metadata: {
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
    });

    // Add phone verification activity if verified
    if (user.isPhoneVerified) {
      activities.push({
        type: 'PHONE_VERIFIED',
        description: 'Phone number verified',
        timestamp: user.createdAt, // TODO: Use actual verification timestamp
      });
    }

    // Add email verification activity if verified
    if (user.isEmailVerified && user.email) {
      activities.push({
        type: 'EMAIL_VERIFIED',
        description: 'Email address verified',
        timestamp: user.updatedAt, // TODO: Use actual verification timestamp
        metadata: {
          email: user.email,
        },
      });
    }

    // Add last login activity if exists
    if (user.lastLoginAt) {
      activities.push({
        type: 'USER_LOGIN',
        description: 'User logged in',
        timestamp: user.lastLoginAt,
      });
    }

    // Add status change activities based on current status
    if (user.status === 'suspended') {
      activities.push({
        type: 'USER_SUSPENDED',
        description: 'User account suspended',
        timestamp: user.updatedAt,
      });
    } else if (user.status === 'banned') {
      activities.push({
        type: 'USER_BANNED',
        description: 'User account banned',
        timestamp: user.updatedAt,
      });
    }

    // Sort activities by timestamp (most recent first)
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply limit
    const limitedActivities = activities.slice(0, limit);

    return {
      userId,
      activities: limitedActivities,
      total: activities.length,
    };

    // TODO: Once activity logging system is implemented, replace above with:
    // const activities = await this.activityLogRepository.find({
    //   where: { userId },
    //   order: { timestamp: 'DESC' },
    //   take: limit,
    // });
    //
    // return {
    //   userId,
    //   activities: activities.map(log => ({
    //     type: log.eventType,
    //     description: log.description,
    //     timestamp: log.timestamp,
    //     metadata: log.metadata,
    //   })),
    //   total: await this.activityLogRepository.count({ where: { userId } }),
    // };
  }
}
