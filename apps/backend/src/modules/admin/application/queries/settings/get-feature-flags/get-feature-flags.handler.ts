import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetFeatureFlagsQuery } from './get-feature-flags.query';

interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  isEnabled: boolean;
  rolloutPercentage: number;
  environments: string[];
}

@QueryHandler(GetFeatureFlagsQuery)
export class GetFeatureFlagsHandler
  implements IQueryHandler<GetFeatureFlagsQuery>
{
  constructor() {}

  async execute(query: GetFeatureFlagsQuery): Promise<{ flags: FeatureFlag[] }> {
    // TODO: Replace with database integration
    // For now, return mock feature flags

    const mockFlags: FeatureFlag[] = [
      {
        key: 'video_consultations',
        name: 'Видеоконсультации',
        description: 'Возможность проводить консультации по видеосвязи',
        isEnabled: true,
        rolloutPercentage: 100,
        environments: ['production', 'staging'],
      },
      {
        key: 'in_person_meetings',
        name: 'Очные встречи',
        description: 'Возможность назначать очные встречи с юристами',
        isEnabled: true,
        rolloutPercentage: 100,
        environments: ['production', 'staging'],
      },
      {
        key: 'emergency_calls',
        name: 'Экстренные вызовы',
        description: 'Возможность экстренного вызова юриста',
        isEnabled: true,
        rolloutPercentage: 100,
        environments: ['production', 'staging'],
      },
      {
        key: 'subscriptions',
        name: 'Подписки',
        description: 'Система подписок для клиентов',
        isEnabled: true,
        rolloutPercentage: 100,
        environments: ['production', 'staging'],
      },
      {
        key: 'referral_program',
        name: 'Реферальная программа',
        description: 'Программа привлечения новых пользователей',
        isEnabled: false,
        rolloutPercentage: 0,
        environments: ['staging'],
      },
      {
        key: 'chat_consultations',
        name: 'Чат-консультации',
        description: 'Консультации в формате чата',
        isEnabled: true,
        rolloutPercentage: 100,
        environments: ['production', 'staging'],
      },
      {
        key: 'lawyer_reviews',
        name: 'Отзывы о юристах',
        description: 'Возможность оставлять отзывы после консультаций',
        isEnabled: true,
        rolloutPercentage: 100,
        environments: ['production', 'staging'],
      },
      {
        key: 'document_templates',
        name: 'Шаблоны документов',
        description: 'Библиотека юридических документов',
        isEnabled: true,
        rolloutPercentage: 50,
        environments: ['staging'],
      },
    ];

    return { flags: mockFlags };
  }
}
