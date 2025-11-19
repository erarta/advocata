import { IQuery } from '@nestjs/cqrs';
import { RevenueMetricsDto } from '../../../../presentation/dtos/analytics/revenue-metrics.dto';

export class GetRevenueMetricsQuery implements IQuery {
  constructor(public readonly dto: RevenueMetricsDto) {}
}
