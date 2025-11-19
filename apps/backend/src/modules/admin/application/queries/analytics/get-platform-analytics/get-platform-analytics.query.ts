import { IQuery } from '@nestjs/cqrs';

export interface PlatformAnalyticsDto {
  dateRange?: 'today' | 'week' | 'month' | 'year' | 'custom';
  startDate?: string;
  endDate?: string;
}

export class GetPlatformAnalyticsQuery implements IQuery {
  constructor(public readonly dto: PlatformAnalyticsDto) {}
}
