import { IQuery } from '@nestjs/cqrs';

export interface GetDisputesDto {
  status?: 'open' | 'in_review' | 'resolved' | 'rejected';
  page?: number;
  limit?: number;
}

export class GetDisputesQuery implements IQuery {
  constructor(public readonly dto: GetDisputesDto = {}) {}
}
