import { IQuery } from '@nestjs/cqrs';
import { RevenueMetricsDto } from '../../../../presentation/dtos/analytics/revenue-metrics.dto';

export class GetRevenueAnalyticsQuery implements IQuery {
  constructor(public readonly dto: RevenueMetricsDto) {}
}
