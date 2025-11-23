import { IQuery } from '@nestjs/cqrs';

export interface GetEmergencyCallsDto {
  status?: 'pending' | 'accepted' | 'completed' | 'cancelled';
  page?: number;
  limit?: number;
}

export class GetEmergencyCallsQuery implements IQuery {
  constructor(public readonly dto: GetEmergencyCallsDto = {}) {}
}
