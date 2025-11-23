import { IQuery } from '@nestjs/cqrs';

export interface GetPayoutHistoryDto {
  lawyerId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export class GetPayoutHistoryQuery implements IQuery {
  constructor(public readonly dto: GetPayoutHistoryDto) {}
}
