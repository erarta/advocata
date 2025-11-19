import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { ReplySupportTicketCommand } from './reply-support-ticket.command';

interface ReplyTicketResult {
  success: boolean;
}

@CommandHandler(ReplySupportTicketCommand)
export class ReplySupportTicketHandler implements ICommandHandler<ReplySupportTicketCommand> {
  private readonly logger = new Logger(ReplySupportTicketHandler.name);

  async execute(command: ReplySupportTicketCommand): Promise<ReplyTicketResult> {
    const { ticketId, dto } = command;

    this.logger.log(`Replying to support ticket: ${ticketId}`);

    // TODO: Find ticket
    // const ticket = await this.ticketRepository.findOne({ where: { id: ticketId }});
    // if (!ticket) {
    //   throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
    // }

    // TODO: Add message
    // const message = {
    //   authorId: 'current-admin-id', // Get from auth context
    //   authorRole: 'admin',
    //   message: dto.message,
    //   attachments: dto.attachments || [],
    //   createdAt: new Date(),
    // };
    // ticket.messages.push(message);
    // ticket.status = 'waiting_for_user';
    // await this.ticketRepository.save(ticket);

    // TODO: Send notification to user
    // await this.notificationService.sendTicketReply(ticket.userId, {
    //   ticketId,
    //   message: dto.message,
    // });

    this.logger.log(`Reply added to support ticket successfully: ${ticketId}`);

    return {
      success: true,
    };
  }
}
