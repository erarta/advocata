import { IQuery } from '@nestjs/cqrs';

export interface GetConsultationStatsDto {
  dateFrom?: string;
  dateTo?: string;
}

export class GetConsultationStatsQuery implements IQuery {
  constructor(public readonly dto: GetConsultationStatsDto = {}) {}
}
