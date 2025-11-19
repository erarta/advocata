import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetLegalInfoPagesQuery } from './get-legal-info-pages.query';

interface LegalInfoPage {
  id: string;
  title: string;
  slug: string;
  type: string;
  status: string;
  publishedAt?: Date;
  seoTitle?: string;
  seoDescription?: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

interface PaginatedResponse {
  items: LegalInfoPage[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@QueryHandler(GetLegalInfoPagesQuery)
export class GetLegalInfoPagesHandler implements IQueryHandler<GetLegalInfoPagesQuery> {
  private readonly logger = new Logger(GetLegalInfoPagesHandler.name);

  async execute(query: GetLegalInfoPagesQuery): Promise<PaginatedResponse> {
    const {
      status,
      type,
      search,
      page = 1,
      limit = 20,
    } = query.dto;

    this.logger.log(`Getting legal info pages with filters: ${JSON.stringify(query.dto)}`);

    // TODO: Replace with actual database query
    const mockPages: LegalInfoPage[] = [
      {
        id: '1',
        title: 'Политика конфиденциальности',
        slug: 'privacy-policy',
        type: 'privacy_policy',
        status: 'published',
        publishedAt: new Date('2025-01-01'),
        seoTitle: 'Политика конфиденциальности - Advocata',
        seoDescription: 'Политика обработки персональных данных платформы Advocata',
        version: 2,
        createdAt: new Date('2024-12-01'),
        updatedAt: new Date('2025-01-01'),
      },
      {
        id: '2',
        title: 'Пользовательское соглашение',
        slug: 'terms-of-service',
        type: 'terms_of_service',
        status: 'published',
        publishedAt: new Date('2025-01-01'),
        seoTitle: 'Пользовательское соглашение - Advocata',
        seoDescription: 'Условия использования платформы Advocata',
        version: 1,
        createdAt: new Date('2024-12-01'),
        updatedAt: new Date('2025-01-01'),
      },
      {
        id: '3',
        title: 'О платформе',
        slug: 'about',
        type: 'about',
        status: 'draft',
        seoTitle: 'О платформе Advocata',
        seoDescription: 'Информация о платформе юридических консультаций Advocata',
        version: 1,
        createdAt: new Date('2025-01-10'),
        updatedAt: new Date('2025-01-15'),
      },
    ];

    // Apply filters
    let filteredPages = mockPages;

    if (status) {
      filteredPages = filteredPages.filter(p => p.status === status);
    }

    if (type) {
      filteredPages = filteredPages.filter(p => p.type === type);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredPages = filteredPages.filter(
        p => p.title.toLowerCase().includes(searchLower) ||
             p.slug.toLowerCase().includes(searchLower)
      );
    }

    const total = filteredPages.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const items = filteredPages.slice(startIndex, endIndex);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }
}
