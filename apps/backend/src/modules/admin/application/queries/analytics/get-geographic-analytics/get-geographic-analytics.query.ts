import { IQuery } from '@nestjs/cqrs';

export interface GeographicAnalyticsDto {
  city?: string;
}

export class GetGeographicAnalyticsQuery implements IQuery {
  constructor(public readonly dto: GeographicAnalyticsDto) {}
}
