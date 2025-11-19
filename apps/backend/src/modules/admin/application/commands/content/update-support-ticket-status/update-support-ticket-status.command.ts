import { ICommand } from '@nestjs/cqrs';
import { UpdateSupportTicketStatusDto } from '../../../../presentation/dtos/content/support-ticket.dto';

export class UpdateSupportTicketStatusCommand implements ICommand {
  constructor(
    public readonly ticketId: string,
    public readonly dto: UpdateSupportTicketStatusDto,
  ) {}
}
