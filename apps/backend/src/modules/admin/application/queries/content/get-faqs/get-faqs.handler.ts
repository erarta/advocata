import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetFaqsQuery } from './get-faqs.query';

interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  status: string;
  order: number;
  viewCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface PaginatedResponse {
  items: Faq[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@QueryHandler(GetFaqsQuery)
export class GetFaqsHandler implements IQueryHandler<GetFaqsQuery> {
  private readonly logger = new Logger(GetFaqsHandler.name);

  async execute(query: GetFaqsQuery): Promise<PaginatedResponse> {
    const {
      category,
      status,
      search,
      page = 1,
      limit = 20,
    } = query.dto;

    this.logger.log(`Getting FAQs with filters: ${JSON.stringify(query.dto)}`);

    // TODO: Replace with actual database query
    const mockFaqs: Faq[] = [
      {
        id: '1',
        question: 'Как забронировать консультацию с юристом?',
        answer: 'Для бронирования консультации выберите юриста по специализации, укажите удобное время и оплатите услугу через приложение.',
        category: 'for_clients',
        status: 'active',
        order: 1,
        viewCount: 1250,
        helpfulCount: 987,
        notHelpfulCount: 23,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
      {
        id: '2',
        question: 'Какие документы нужны для верификации юриста?',
        answer: 'Для верификации необходимы: диплом о юридическом образовании, удостоверение адвоката (если есть), паспорт, и документы, подтверждающие опыт работы.',
        category: 'for_lawyers',
        status: 'active',
        order: 1,
        viewCount: 567,
        helpfulCount: 453,
        notHelpfulCount: 12,
        createdAt: new Date('2025-01-02'),
        updatedAt: new Date('2025-01-02'),
      },
      {
        id: '3',
        question: 'Как происходит оплата консультаций?',
        answer: 'Оплата производится через ЮКасса. Деньги удерживаются при бронировании и переводятся юристу после завершения консультации.',
        category: 'payments',
        status: 'active',
        order: 1,
        viewCount: 890,
        helpfulCount: 756,
        notHelpfulCount: 34,
        createdAt: new Date('2025-01-03'),
        updatedAt: new Date('2025-01-03'),
      },
    ];

    // Apply filters
    let filteredFaqs = mockFaqs;

    if (category) {
      filteredFaqs = filteredFaqs.filter(f => f.category === category);
    }

    if (status) {
      filteredFaqs = filteredFaqs.filter(f => f.status === status);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredFaqs = filteredFaqs.filter(
        f => f.question.toLowerCase().includes(searchLower) ||
             f.answer.toLowerCase().includes(searchLower)
      );
    }

    const total = filteredFaqs.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const items = filteredFaqs.slice(startIndex, endIndex);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }
}
