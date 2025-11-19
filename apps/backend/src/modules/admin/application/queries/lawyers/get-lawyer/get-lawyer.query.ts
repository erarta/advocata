import { IQuery } from '@nestjs/cqrs';

export class GetLawyerQuery implements IQuery {
  constructor(public readonly lawyerId: string) {}
}
