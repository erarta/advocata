import { ICommand } from '@nestjs/cqrs';
import { AssignSupportTicketDto } from '../../../../presentation/dtos/content/support-ticket.dto';

export class AssignSupportTicketCommand implements ICommand {
  constructor(
    public readonly ticketId: string,
    public readonly dto: AssignSupportTicketDto,
  ) {}
}
