import { IQuery } from '@nestjs/cqrs';

export class GetUserActivityQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly limit?: number,
  ) {}
}
