import { IQuery } from '@nestjs/cqrs';

export interface GetLawyerPerformanceDto {
  page?: number;
  limit?: number;
  sortBy?: 'rating' | 'consultations' | 'earnings';
}

export class GetLawyerPerformanceQuery implements IQuery {
  constructor(public readonly dto: GetLawyerPerformanceDto) {}
}
