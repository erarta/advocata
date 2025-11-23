import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { GetDocumentTemplateQuery } from './get-document-template.query';

interface DocumentTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  content: string;
  isPremium: boolean;
  price?: number;
  downloadCount: number;
  variables: any[];
  version: number;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

@QueryHandler(GetDocumentTemplateQuery)
export class GetDocumentTemplateHandler implements IQueryHandler<GetDocumentTemplateQuery> {
  private readonly logger = new Logger(GetDocumentTemplateHandler.name);

  async execute(query: GetDocumentTemplateQuery): Promise<DocumentTemplate> {
    const { templateId } = query;

    this.logger.log(`Getting document template: ${templateId}`);

    // TODO: Replace with actual database query
    // const template = await this.documentTemplateRepository.findOne({ where: { id: templateId }});

    // Mock data
    const mockTemplate: DocumentTemplate = {
      id: templateId,
      title: 'Заявление о ДТП',
      description: 'Стандартное заявление в ГИБДД о дорожно-транспортном происшествии',
      category: 'traffic_accident',
      status: 'active',
      content: `В ГИБДД [НАЗВАНИЕ_ОТДЕЛА]

От [CLIENT_NAME]
Адрес: [CLIENT_ADDRESS]
Телефон: [CLIENT_PHONE]

ЗАЯВЛЕНИЕ

Прошу рассмотреть материалы дорожно-транспортного происшествия, произошедшего [INCIDENT_DATE] в [INCIDENT_LOCATION].

Обстоятельства происшествия: [DESCRIPTION]

[SIGNATURE]
[DATE]`,
      isPremium: false,
      downloadCount: 234,
      variables: [
        { key: 'client_name', label: 'ФИО клиента', type: 'text', required: true },
        { key: 'client_address', label: 'Адрес клиента', type: 'text', required: true },
        { key: 'client_phone', label: 'Телефон клиента', type: 'tel', required: true },
        { key: 'incident_date', label: 'Дата происшествия', type: 'date', required: true },
        { key: 'incident_location', label: 'Место происшествия', type: 'text', required: true },
        { key: 'description', label: 'Описание обстоятельств', type: 'textarea', required: true },
      ],
      version: 1,
      metadata: {
        format: 'docx',
        pageSize: 'A4',
        margins: 'standard',
      },
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-15'),
    };

    if (!mockTemplate) {
      throw new NotFoundException(`Document template with ID ${templateId} not found`);
    }

    return mockTemplate;
  }
}
