import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetSupportTicketsQuery } from './get-support-tickets.query';

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
  };
  assignedTo?: string;
  assignedToInfo?: {
    id: string;
    name: string;
  };
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface PaginatedResponse {
  items: SupportTicket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@QueryHandler(GetSupportTicketsQuery)
export class GetSupportTicketsHandler implements IQueryHandler<GetSupportTicketsQuery> {
  private readonly logger = new Logger(GetSupportTicketsHandler.name);

  async execute(query: GetSupportTicketsQuery): Promise<PaginatedResponse> {
    const {
      status,
      priority,
      category,
      assignedTo,
      search,
      page = 1,
      limit = 20,
    } = query.dto;

    this.logger.log(`Getting support tickets with filters: ${JSON.stringify(query.dto)}`);

    // TODO: Replace with actual database query
    const mockTickets: SupportTicket[] = [
      {
        id: '1',
        subject: 'Не могу войти в аккаунт',
        status: 'open',
        priority: 'high',
        category: 'technical',
        userId: 'user-1',
        userInfo: {
          id: 'user-1',
          name: 'Иван Петров',
          email: 'ivan@example.com',
        },
        messageCount: 3,
        createdAt: new Date('2025-01-15T10:00:00'),
        updatedAt: new Date('2025-01-15T15:30:00'),
      },
      {
        id: '2',
        subject: 'Проблема с оплатой консультации',
        status: 'in_progress',
        priority: 'urgent',
        category: 'payment',
        userId: 'user-2',
        userInfo: {
          id: 'user-2',
          name: 'Анна Сидорова',
          email: 'anna@example.com',
        },
        assignedTo: 'admin-1',
        assignedToInfo: {
          id: 'admin-1',
          name: 'Администратор 1',
        },
        messageCount: 7,
        createdAt: new Date('2025-01-14T14:20:00'),
        updatedAt: new Date('2025-01-15T16:00:00'),
      },
      {
        id: '3',
        subject: 'Запрос на возврат средств',
        status: 'resolved',
        priority: 'medium',
        category: 'refund',
        userId: 'user-3',
        userInfo: {
          id: 'user-3',
          name: 'Дмитрий Козлов',
          email: 'dmitry@example.com',
        },
        assignedTo: 'admin-2',
        assignedToInfo: {
          id: 'admin-2',
          name: 'Администратор 2',
        },
        messageCount: 5,
        createdAt: new Date('2025-01-13T09:15:00'),
        updatedAt: new Date('2025-01-14T18:45:00'),
      },
    ];

    // Apply filters
    let filteredTickets = mockTickets;

    if (status) {
      filteredTickets = filteredTickets.filter(t => t.status === status);
    }

    if (priority) {
      filteredTickets = filteredTickets.filter(t => t.priority === priority);
    }

    if (category) {
      filteredTickets = filteredTickets.filter(t => t.category === category);
    }

    if (assignedTo) {
      filteredTickets = filteredTickets.filter(t => t.assignedTo === assignedTo);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredTickets = filteredTickets.filter(
        t => t.subject.toLowerCase().includes(searchLower) ||
             t.userInfo.name.toLowerCase().includes(searchLower) ||
             t.userInfo.email.toLowerCase().includes(searchLower)
      );
    }

    const total = filteredTickets.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const items = filteredTickets.slice(startIndex, endIndex);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }
}
