import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetSMSConfigQuery } from './get-sms-config.query';

interface SMSConfig {
  provider: 'twilio' | 'sms.ru' | 'smsc';
  isEnabled: boolean;
  senderName?: string;

  // Twilio (masked)
  twilioAccountSidMasked?: string;
  twilioAuthTokenMasked?: string;
  twilioPhoneNumber?: string;

  // SMS.ru / SMSC (masked)
  apiKeyMasked?: string;

  // Test configuration
  lastTestDate?: Date;
  lastTestStatus?: 'success' | 'failed';
  lastTestError?: string;

  // Usage statistics
  monthlyQuota?: number;
  monthlyUsed?: number;
}

@QueryHandler(GetSMSConfigQuery)
export class GetSMSConfigHandler implements IQueryHandler<GetSMSConfigQuery> {
  constructor() {}

  async execute(query: GetSMSConfigQuery): Promise<SMSConfig> {
    // TODO: Replace with database/config integration
    // For now, return mock SMS configuration
    // IMPORTANT: Always mask sensitive data (API keys, tokens)

    const mockConfig: SMSConfig = {
      provider: 'sms.ru',
      isEnabled: true,
      senderName: 'Advocata',

      // Masked API key - show only last 4 characters
      apiKeyMasked: '********************************8F2E',

      lastTestDate: new Date('2025-11-17T15:30:00'),
      lastTestStatus: 'success',

      monthlyQuota: 10000,
      monthlyUsed: 3456,
    };

    return mockConfig;
  }

  /**
   * Helper method to mask sensitive data
   * Shows only last 4 characters
   */
  private maskSensitiveData(value: string): string {
    if (!value || value.length <= 4) {
      return '****';
    }
    const visibleChars = value.slice(-4);
    const maskedChars = '*'.repeat(value.length - 4);
    return maskedChars + visibleChars;
  }
}
