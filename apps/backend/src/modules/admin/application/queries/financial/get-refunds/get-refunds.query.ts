import { IQuery } from '@nestjs/cqrs';

export interface GetRefundsDto {
  status?: 'pending' | 'approved' | 'rejected' | 'processed';
  clientId?: string;
  consultationId?: string;
  page?: number;
  limit?: number;
}

export class GetRefundsQuery implements IQuery {
  constructor(public readonly dto: GetRefundsDto) {}
}
