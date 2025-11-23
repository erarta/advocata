import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { GetSupportTicketQuery } from './get-support-ticket.query';

interface TicketMessage {
  id: string;
  authorId: string;
  authorRole: string;
  authorName: string;
  message: string;
  attachments?: string[];
  createdAt: Date;
}

interface InternalNote {
  id: string;
  adminId: string;
  adminName: string;
  note: string;
  createdAt: Date;
}

interface SupportTicket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  category: string;
  userId: string;
  userInfo: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  assignedTo?: string;
  assignedToInfo?: {
    id: string;
    name: string;
  };
  messages: TicketMessage[];
  internalNotes: InternalNote[];
  createdAt: Date;
  updatedAt: Date;
}

@QueryHandler(GetSupportTicketQuery)
export class GetSupportTicketHandler implements IQueryHandler<GetSupportTicketQuery> {
  private readonly logger = new Logger(GetSupportTicketHandler.name);

  async execute(query: GetSupportTicketQuery): Promise<SupportTicket> {
    const { ticketId } = query;

    this.logger.log(`Getting support ticket: ${ticketId}`);

    // TODO: Replace with actual database query
    const mockTicket: SupportTicket = {
      id: ticketId,
      subject: 'Проблема с оплатой консультации',
      status: 'in_progress',
      priority: 'urgent',
      category: 'payment',
      userId: 'user-2',
      userInfo: {
        id: 'user-2',
        name: 'Анна Сидорова',
        email: 'anna@example.com',
        phone: '+79123456789',
      },
      assignedTo: 'admin-1',
      assignedToInfo: {
        id: 'admin-1',
        name: 'Администратор 1',
      },
      messages: [
        {
          id: 'msg-1',
          authorId: 'user-2',
          authorRole: 'user',
          authorName: 'Анна Сидорова',
          message: 'Здравствуйте! Я забронировала консультацию и оплатила её, но деньги списались, а консультация не появилась в моём аккаунте.',
          createdAt: new Date('2025-01-14T14:20:00'),
        },
        {
          id: 'msg-2',
          authorId: 'admin-1',
          authorRole: 'admin',
          authorName: 'Администратор 1',
          message: 'Здравствуйте, Анна! Проверяю вашу проблему. Можете указать номер транзакции?',
          createdAt: new Date('2025-01-14T14:45:00'),
        },
        {
          id: 'msg-3',
          authorId: 'user-2',
          authorRole: 'user',
          authorName: 'Анна Сидорова',
          message: 'Номер транзакции: TRX-20250114-12345',
          createdAt: new Date('2025-01-14T15:00:00'),
        },
        {
          id: 'msg-4',
          authorId: 'admin-1',
          authorRole: 'admin',
          authorName: 'Администратор 1',
          message: 'Спасибо! Проверяем платёж. Свяжемся с вами в ближайшее время.',
          createdAt: new Date('2025-01-15T16:00:00'),
        },
      ],
      internalNotes: [
        {
          id: 'note-1',
          adminId: 'admin-1',
          adminName: 'Администратор 1',
          note: 'Платёж прошёл успешно в ЮКасса, но webhook не сработал. Нужно вручную активировать консультацию.',
          createdAt: new Date('2025-01-15T15:30:00'),
        },
      ],
      createdAt: new Date('2025-01-14T14:20:00'),
      updatedAt: new Date('2025-01-15T16:00:00'),
    };

    if (!mockTicket) {
      throw new NotFoundException(`Support ticket with ID ${ticketId} not found`);
    }

    return mockTicket;
  }
}
