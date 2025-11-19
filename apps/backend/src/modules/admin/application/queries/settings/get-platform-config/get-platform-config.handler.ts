import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPlatformConfigQuery } from './get-platform-config.query';

interface PlatformConfig {
  name: string;
  logoUrl: string;
  faviconUrl: string;
  timezone: string;
  currency: string;
  supportEmail: string;
  supportPhone: string;
  socialMedia: {
    vk?: string;
    telegram?: string;
    whatsapp?: string;
    youtube?: string;
    instagram?: string;
  };
  features: {
    maintenanceMode: boolean;
    allowRegistrations: boolean;
    requireEmailVerification: boolean;
  };
  locale: {
    defaultLanguage: string;
    availableLanguages: string[];
  };
}

@QueryHandler(GetPlatformConfigQuery)
export class GetPlatformConfigHandler
  implements IQueryHandler<GetPlatformConfigQuery>
{
  constructor() {}

  async execute(query: GetPlatformConfigQuery): Promise<PlatformConfig> {
    // TODO: Replace with database/config file integration
    // For now, return mock platform configuration

    const mockConfig: PlatformConfig = {
      name: 'Advocata',
      logoUrl: 'https://advocata.ru/logo.svg',
      faviconUrl: 'https://advocata.ru/favicon.ico',
      timezone: 'Europe/Moscow',
      currency: 'RUB',
      supportEmail: 'support@advocata.ru',
      supportPhone: '+7 (812) 123-45-67',
      socialMedia: {
        vk: 'https://vk.com/advocata',
        telegram: 'https://t.me/advocata_official',
        whatsapp: '+79211234567',
        youtube: 'https://youtube.com/@advocata',
        instagram: 'https://instagram.com/advocata.ru',
      },
      features: {
        maintenanceMode: false,
        allowRegistrations: true,
        requireEmailVerification: true,
      },
      locale: {
        defaultLanguage: 'ru',
        availableLanguages: ['ru', 'en'],
      },
    };

    return mockConfig;
  }
}
