import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { GetNotificationTemplateQuery } from './get-notification-template.query';

interface NotificationTemplate {
  id: string;
  type: 'email' | 'sms' | 'push';
  category: string;
  name: string;
  subject?: string;
  bodyText: string;
  bodyHtml?: string;
  variables: string[];
  isActive: boolean;
  version: number;
  lastUpdated: Date;
  createdAt: Date;
}

@QueryHandler(GetNotificationTemplateQuery)
export class GetNotificationTemplateHandler
  implements IQueryHandler<GetNotificationTemplateQuery>
{
  constructor() {}

  async execute(
    query: GetNotificationTemplateQuery,
  ): Promise<NotificationTemplate> {
    // TODO: Replace with database integration
    // For now, return mock notification template

    const mockTemplates: Record<string, NotificationTemplate> = {
      tpl_001: {
        id: 'tpl_001',
        type: 'email',
        category: 'auth',
        name: 'Подтверждение email',
        subject: 'Подтвердите ваш email - Advocata',
        bodyText:
          'Здравствуйте, {{user_name}}! Подтвердите ваш email: {{verification_link}}',
        bodyHtml:
          '<p>Здравствуйте, {{user_name}}!</p><p>Подтвердите ваш email: <a href="{{verification_link}}">Подтвердить</a></p>',
        variables: ['user_name', 'verification_link'],
        isActive: true,
        version: 3,
        lastUpdated: new Date('2025-11-15'),
        createdAt: new Date('2025-01-10'),
      },
      tpl_002: {
        id: 'tpl_002',
        type: 'email',
        category: 'consultation',
        name: 'Консультация подтверждена',
        subject: 'Консультация подтверждена - Advocata',
        bodyText:
          'Здравствуйте, {{user_name}}! Ваша консультация с юристом {{lawyer_name}} назначена на {{consultation_time}}.',
        bodyHtml:
          '<p>Здравствуйте, {{user_name}}!</p><p>Ваша консультация с юристом <strong>{{lawyer_name}}</strong> назначена на {{consultation_time}}.</p>',
        variables: ['user_name', 'lawyer_name', 'consultation_time'],
        isActive: true,
        version: 2,
        lastUpdated: new Date('2025-11-10'),
        createdAt: new Date('2025-01-15'),
      },
    };

    const template = mockTemplates[query.templateId];
    if (!template) {
      throw new NotFoundException(
        `Template with ID ${query.templateId} not found`,
      );
    }

    return template;
  }
}
