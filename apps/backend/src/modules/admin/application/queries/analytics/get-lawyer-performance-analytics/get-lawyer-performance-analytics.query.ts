import { IQuery } from '@nestjs/cqrs';

export interface LawyerPerformanceDto {
  dateRange?: 'today' | 'week' | 'month' | 'year' | 'custom';
  startDate?: string;
  endDate?: string;
  lawyerId?: string;
}

export class GetLawyerPerformanceAnalyticsQuery implements IQuery {
  constructor(public readonly dto: LawyerPerformanceDto) {}
}
