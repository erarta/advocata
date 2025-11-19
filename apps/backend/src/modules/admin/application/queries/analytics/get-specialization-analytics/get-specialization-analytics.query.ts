import { IQuery } from '@nestjs/cqrs';

export interface SpecializationAnalyticsDto {
  // No specific filters needed for now
}

export class GetSpecializationAnalyticsQuery implements IQuery {
  constructor(public readonly dto: SpecializationAnalyticsDto = {}) {}
}
