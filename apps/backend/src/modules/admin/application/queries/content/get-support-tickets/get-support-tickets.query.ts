import { IQuery } from '@nestjs/cqrs';
import { GetSupportTicketsDto } from '../../../../presentation/dtos/content/support-ticket.dto';

export class GetSupportTicketsQuery implements IQuery {
  constructor(public readonly dto: GetSupportTicketsDto) {}
}
