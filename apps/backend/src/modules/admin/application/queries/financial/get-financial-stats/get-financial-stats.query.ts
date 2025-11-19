import { IQuery } from '@nestjs/cqrs';

export interface GetFinancialStatsDto {
  dateFrom?: string;
  dateTo?: string;
}

export class GetFinancialStatsQuery implements IQuery {
  constructor(public readonly dto: GetFinancialStatsDto) {}
}
