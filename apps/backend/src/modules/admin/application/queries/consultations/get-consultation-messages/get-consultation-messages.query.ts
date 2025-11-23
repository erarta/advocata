import { IQuery } from '@nestjs/cqrs';

export interface GetConsultationMessagesDto {
  page?: number;
  limit?: number;
}

export class GetConsultationMessagesQuery implements IQuery {
  constructor(
    public readonly consultationId: string,
    public readonly dto: GetConsultationMessagesDto = {},
  ) {}
}
