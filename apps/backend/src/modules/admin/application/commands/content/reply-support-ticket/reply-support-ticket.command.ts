import { ICommand } from '@nestjs/cqrs';
import { ReplySupportTicketDto } from '../../../../presentation/dtos/content/support-ticket.dto';

export class ReplySupportTicketCommand implements ICommand {
  constructor(
    public readonly ticketId: string,
    public readonly dto: ReplySupportTicketDto,
  ) {}
}
