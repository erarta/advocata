import { IQuery } from '@nestjs/cqrs';

export interface GetPendingLawyersDto {
  page?: number;
  limit?: number;
  search?: string;
}

export class GetPendingLawyersQuery implements IQuery {
  constructor(public readonly dto: GetPendingLawyersDto) {}
}
