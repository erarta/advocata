import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetNotificationTemplatesQuery } from './get-notification-templates.query';

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
}

@QueryHandler(GetNotificationTemplatesQuery)
export class GetNotificationTemplatesHandler
  implements IQueryHandler<GetNotificationTemplatesQuery>
{
  constructor() {}

  async execute(
    query: GetNotificationTemplatesQuery,
  ): Promise<{ items: NotificationTemplate[]; total: number }> {
    // TODO: Replace with database integration
    // For now, return mock notification templates

    const mockTemplates: NotificationTemplate[] = [
      {
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
      },
      {
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
      },
      {
        id: 'tpl_003',
        type: 'sms',
        category: 'consultation',
        name: 'Напоминание о консультации',
        bodyText:
          'Напоминание: консультация через 30 минут с {{lawyer_name}}. Ссылка: {{consultation_link}}',
        variables: ['lawyer_name', 'consultation_link'],
        isActive: true,
        version: 1,
        lastUpdated: new Date('2025-11-01'),
      },
      {
        id: 'tpl_004',
        type: 'push',
        category: 'consultation',
        name: 'Юрист на связи',
        bodyText: 'Юрист {{lawyer_name}} готов начать консультацию',
        variables: ['lawyer_name'],
        isActive: true,
        version: 1,
        lastUpdated: new Date('2025-11-05'),
      },
      {
        id: 'tpl_005',
        type: 'email',
        category: 'payment',
        name: 'Платеж получен',
        subject: 'Платеж успешно обработан - Advocata',
        bodyText:
          'Здравствуйте, {{user_name}}! Ваш платеж на сумму {{amount}} RUB успешно обработан.',
        bodyHtml:
          '<p>Здравствуйте, {{user_name}}!</p><p>Ваш платеж на сумму <strong>{{amount}} RUB</strong> успешно обработан.</p>',
        variables: ['user_name', 'amount'],
        isActive: true,
        version: 1,
        lastUpdated: new Date('2025-10-28'),
      },
    ];

    // Filter by type and category
    let filteredTemplates = mockTemplates;
    if (query.type) {
      filteredTemplates = filteredTemplates.filter((t) => t.type === query.type);
    }
    if (query.category) {
      filteredTemplates = filteredTemplates.filter(
        (t) => t.category === query.category,
      );
    }

    // Pagination
    const total = filteredTemplates.length;
    const startIndex = (query.page - 1) * query.limit;
    const paginatedTemplates = filteredTemplates.slice(
      startIndex,
      startIndex + query.limit,
    );

    return {
      items: paginatedTemplates,
      total,
    };
  }
}
