import { IQuery } from '@nestjs/cqrs';

export interface GetTransactionsDto {
  type?: 'payment' | 'payout' | 'refund' | 'subscription' | 'commission';
  status?: 'pending' | 'processing' | 'completed' | 'failed' | 'succeeded' | 'canceled' | 'refunded';
  userId?: string;
  lawyerId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'amount';
  sortOrder?: 'asc' | 'desc';
}

export class GetTransactionsQuery implements IQuery {
  constructor(public readonly dto: GetTransactionsDto) {}
}
