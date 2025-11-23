import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetDocumentTemplatesQuery } from './get-document-templates.query';

interface DocumentTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  isPremium: boolean;
  price?: number;
  downloadCount: number;
  variables: any[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

interface PaginatedResponse {
  items: DocumentTemplate[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@QueryHandler(GetDocumentTemplatesQuery)
export class GetDocumentTemplatesHandler implements IQueryHandler<GetDocumentTemplatesQuery> {
  private readonly logger = new Logger(GetDocumentTemplatesHandler.name);

  async execute(query: GetDocumentTemplatesQuery): Promise<PaginatedResponse> {
    const {
      category,
      status,
      isPremium,
      search,
      page = 1,
      limit = 20,
    } = query.dto;

    this.logger.log(`Getting document templates with filters: ${JSON.stringify(query.dto)}`);

    // TODO: Replace with actual database query
    // const queryBuilder = this.documentTemplateRepository.createQueryBuilder('template');

    // Mock data for now
    const mockTemplates: DocumentTemplate[] = [
      {
        id: '1',
        title: 'Заявление о ДТП',
        description: 'Стандартное заявление в ГИБДД о дорожно-транспортном происшествии',
        category: 'traffic_accident',
        status: 'active',
        isPremium: false,
        downloadCount: 234,
        variables: [
          { key: 'client_name', label: 'ФИО клиента', type: 'text', required: true },
          { key: 'incident_date', label: 'Дата происшествия', type: 'date', required: true },
          { key: 'incident_location', label: 'Место происшествия', type: 'text', required: true },
        ],
        version: 1,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-15'),
      },
      {
        id: '2',
        title: 'Трудовой договор (стандартный)',
        description: 'Типовой трудовой договор для найма сотрудников',
        category: 'labor_law',
        status: 'active',
        isPremium: true,
        price: 500,
        downloadCount: 567,
        variables: [
          { key: 'employer_name', label: 'Наименование работодателя', type: 'text', required: true },
          { key: 'employee_name', label: 'ФИО работника', type: 'text', required: true },
          { key: 'position', label: 'Должность', type: 'text', required: true },
          { key: 'salary', label: 'Оклад', type: 'number', required: true },
        ],
        version: 3,
        createdAt: new Date('2024-12-01'),
        updatedAt: new Date('2025-01-10'),
      },
    ];

    // Apply filters (mock implementation)
    let filteredTemplates = mockTemplates;

    if (category) {
      filteredTemplates = filteredTemplates.filter(t => t.category === category);
    }

    if (status) {
      filteredTemplates = filteredTemplates.filter(t => t.status === status);
    }

    if (isPremium !== undefined) {
      filteredTemplates = filteredTemplates.filter(t => t.isPremium === isPremium);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredTemplates = filteredTemplates.filter(
        t => t.title.toLowerCase().includes(searchLower) ||
             t.description.toLowerCase().includes(searchLower)
      );
    }

    const total = filteredTemplates.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const items = filteredTemplates.slice(startIndex, endIndex);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }
}
