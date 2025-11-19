import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetRateLimitsQuery } from './get-rate-limits.query';

interface RateLimit {
  id: string;
  resource: string;
  method: string;
  role: string;
  limit: number;
  window: string;
  description: string;
}

@QueryHandler(GetRateLimitsQuery)
export class GetRateLimitsHandler
  implements IQueryHandler<GetRateLimitsQuery>
{
  constructor() {}

  async execute(query: GetRateLimitsQuery): Promise<{ limits: RateLimit[] }> {
    // TODO: Replace with database integration
    // For now, return mock rate limits

    const mockLimits: RateLimit[] = [
      {
        id: 'rl_001',
        resource: '/api/users',
        method: 'GET',
        role: 'guest',
        limit: 10,
        window: 'minute',
        description: 'Просмотр пользователей для гостей',
      },
      {
        id: 'rl_002',
        resource: '/api/users',
        method: 'GET',
        role: 'client',
        limit: 60,
        window: 'minute',
        description: 'Просмотр пользователей для клиентов',
      },
      {
        id: 'rl_003',
        resource: '/api/lawyers',
        method: 'GET',
        role: 'guest',
        limit: 20,
        window: 'minute',
        description: 'Поиск юристов для гостей',
      },
      {
        id: 'rl_004',
        resource: '/api/lawyers',
        method: 'GET',
        role: 'client',
        limit: 100,
        window: 'minute',
        description: 'Поиск юристов для клиентов',
      },
      {
        id: 'rl_005',
        resource: '/api/consultations',
        method: 'POST',
        role: 'client',
        limit: 10,
        window: 'hour',
        description: 'Создание консультаций для клиентов',
      },
      {
        id: 'rl_006',
        resource: '/api/consultations',
        method: 'POST',
        role: 'lawyer',
        limit: 50,
        window: 'hour',
        description: 'Управление консультациями для юристов',
      },
      {
        id: 'rl_007',
        resource: '/api/payments',
        method: 'POST',
        role: 'client',
        limit: 5,
        window: 'hour',
        description: 'Создание платежей для клиентов',
      },
      {
        id: 'rl_008',
        resource: '/api/admin',
        method: 'POST',
        role: 'admin',
        limit: 1000,
        window: 'hour',
        description: 'Администраторские операции',
      },
    ];

    return { limits: mockLimits };
  }
}
