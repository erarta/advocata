import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { AssignSupportTicketCommand } from './assign-support-ticket.command';

interface AssignTicketResult {
  success: boolean;
}

@CommandHandler(AssignSupportTicketCommand)
export class AssignSupportTicketHandler implements ICommandHandler<AssignSupportTicketCommand> {
  private readonly logger = new Logger(AssignSupportTicketHandler.name);

  async execute(command: AssignSupportTicketCommand): Promise<AssignTicketResult> {
    const { ticketId, dto } = command;

    this.logger.log(`Assigning support ticket ${ticketId} to admin ${dto.adminId}`);

    // TODO: Find ticket
    // const ticket = await this.ticketRepository.findOne({ where: { id: ticketId }});
    // if (!ticket) {
    //   throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
    // }

    // TODO: Assign ticket
    // ticket.assignedTo = dto.adminId;
    // ticket.status = 'in_progress';
    // await this.ticketRepository.save(ticket);

    // TODO: Log action
    // await this.auditLogService.log({
    //   action: 'SUPPORT_TICKET_ASSIGNED',
    //   ticketId,
    //   adminId: dto.adminId,
    // });

    this.logger.log(`Support ticket assigned successfully: ${ticketId}`);

    return {
      success: true,
    };
  }
}
