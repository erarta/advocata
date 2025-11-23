import { IQuery } from '@nestjs/cqrs';

export interface GetSubscriptionsDto {
  status?: 'active' | 'cancelled' | 'expired';
  tier?: 'basic' | 'premium' | 'vip';
  userId?: string;
  page?: number;
  limit?: number;
}

export class GetSubscriptionsQuery implements IQuery {
  constructor(public readonly dto: GetSubscriptionsDto) {}
}
