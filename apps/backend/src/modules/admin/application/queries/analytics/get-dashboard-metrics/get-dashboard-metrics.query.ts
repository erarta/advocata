import { IQuery } from '@nestjs/cqrs';

export interface DashboardMetricsDto {
  dateRange?: 'today' | 'week' | 'month' | 'year' | 'custom';
  startDate?: string;
  endDate?: string;
}

export class GetDashboardMetricsQuery implements IQuery {
  constructor(public readonly dto: DashboardMetricsDto) {}
}
