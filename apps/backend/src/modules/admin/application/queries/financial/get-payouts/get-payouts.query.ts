import { IQuery } from '@nestjs/cqrs';

export interface GetPayoutsDto {
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  lawyerId?: string;
  minAmount?: number;
  page?: number;
  limit?: number;
}

export class GetPayoutsQuery implements IQuery {
  constructor(public readonly dto: GetPayoutsDto) {}
}
