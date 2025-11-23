import { Result } from '@/shared/domain/result';

/**
 * Email Service Interface
 *
 * Abstraction for email service providers (SendGrid, etc.)
 */
export interface IEmailService {
  /**
   * Send a single email
   */
  sendEmail(
    to: string,
    subject: string,
    body: string,
    html?: string,
  ): Promise<Result<string>>;

  /**
   * Send email using a template
   */
  sendTemplateEmail(
    to: string,
    templateId: string,
    templateData: Record<string, any>,
  ): Promise<Result<string>>;

  /**
   * Send bulk emails
   */
  sendBulkEmail(
    emails: Array<{
      to: string;
      subject: string;
      body: string;
      html?: string;
    }>,
  ): Promise<Result<string[]>>;
}

export const EMAIL_SERVICE = Symbol('EMAIL_SERVICE');
