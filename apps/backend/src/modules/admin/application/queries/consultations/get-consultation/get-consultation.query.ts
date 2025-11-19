import { IQuery } from '@nestjs/cqrs';

export class GetConsultationQuery implements IQuery {
  constructor(public readonly consultationId: string) {}
}
