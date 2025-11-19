import { IQuery } from '@nestjs/cqrs';

export interface GetLawyerReviewsDto {
  page?: number;
  limit?: number;
}

export class GetLawyerReviewsQuery implements IQuery {
  constructor(
    public readonly lawyerId: string,
    public readonly dto: GetLawyerReviewsDto,
  ) {}
}
