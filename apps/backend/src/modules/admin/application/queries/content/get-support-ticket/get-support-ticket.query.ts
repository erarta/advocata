import { IQuery } from '@nestjs/cqrs';

export class GetSupportTicketQuery implements IQuery {
  constructor(public readonly ticketId: string) {}
}
