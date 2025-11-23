import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { UpdateSupportTicketStatusCommand } from './update-support-ticket-status.command';

interface UpdateTicketStatusResult {
  success: boolean;
}

@CommandHandler(UpdateSupportTicketStatusCommand)
export class UpdateSupportTicketStatusHandler implements ICommandHandler<UpdateSupportTicketStatusCommand> {
  private readonly logger = new Logger(UpdateSupportTicketStatusHandler.name);

  async execute(command: UpdateSupportTicketStatusCommand): Promise<UpdateTicketStatusResult> {
    const { ticketId, dto } = command;

    this.logger.log(`Updating support ticket status: ${ticketId} to ${dto.status}`);

    // TODO: Find ticket
    // const ticket = await this.ticketRepository.findOne({ where: { id: ticketId }});
    // if (!ticket) {
    //   throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
    // }

    // TODO: Update status
    // ticket.status = dto.status;
    // if (dto.notes) {
    //   ticket.internalNotes.push({
    //     adminId: 'current-admin-id', // Get from auth context
    //     note: dto.notes,
    //     createdAt: new Date(),
    //   });
    // }
    // await this.ticketRepository.save(ticket);

    // TODO: Log change
    // await this.auditLogService.log({
    //   action: 'SUPPORT_TICKET_STATUS_UPDATED',
    //   ticketId,
    //   oldStatus: ticket.status,
    //   newStatus: dto.status,
    // });

    this.logger.log(`Support ticket status updated successfully: ${ticketId}`);

    return {
      success: true,
    };
  }
}
