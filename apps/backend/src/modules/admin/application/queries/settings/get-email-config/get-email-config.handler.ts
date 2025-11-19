import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetEmailConfigQuery } from './get-email-config.query';

interface EmailConfig {
  provider: 'smtp' | 'sendgrid' | 'mailgun' | 'ses';
  isEnabled: boolean;
  fromEmail: string;
  fromName: string;
  replyToEmail?: string;

  // SMTP specific (masked)
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUsername?: string;
  smtpPasswordMasked?: string; // Masked password

  // SendGrid/Mailgun/SES (masked)
  apiKeyMasked?: string; // Masked API key

  // Test configuration
  lastTestDate?: Date;
  lastTestStatus?: 'success' | 'failed';
  lastTestError?: string;
}

@QueryHandler(GetEmailConfigQuery)
export class GetEmailConfigHandler
  implements IQueryHandler<GetEmailConfigQuery>
{
  constructor() {}

  async execute(query: GetEmailConfigQuery): Promise<EmailConfig> {
    // TODO: Replace with database/config integration
    // For now, return mock email configuration
    // IMPORTANT: Always mask sensitive data (passwords, API keys)

    const mockConfig: EmailConfig = {
      provider: 'sendgrid',
      isEnabled: true,
      fromEmail: 'noreply@advocata.ru',
      fromName: 'Advocata',
      replyToEmail: 'support@advocata.ru',

      // Masked API key - show only last 4 characters
      apiKeyMasked: '****************************A7B9',

      lastTestDate: new Date('2025-11-18T10:00:00'),
      lastTestStatus: 'success',
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
