import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IEmailService } from '../../domain/services/email.service.interface';
import { Result } from '@/shared/domain/result';
import * as sgMail from '@sendgrid/mail';

/**
 * SendGrid Email Service
 *
 * Implements email sending using SendGrid API
 */
@Injectable()
export class SendGridService implements IEmailService {
  private readonly logger = new Logger(SendGridService.name);
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    this.fromEmail = this.configService.get<string>('SENDGRID_FROM_EMAIL', 'noreply@advocata.ru');
    this.fromName = this.configService.get<string>('SENDGRID_FROM_NAME', 'Advocata');

    if (apiKey) {
      sgMail.setApiKey(apiKey);
    } else {
      this.logger.warn('SendGrid API key not configured');
    }
  }

  /**
   * Send a single email
   */
  async sendEmail(
    to: string,
    subject: string,
    body: string,
    html?: string,
  ): Promise<Result<string>> {
    try {
      const msg = {
        to,
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        subject,
        text: body,
        html: html || body,
      };

      const [response] = await sgMail.send(msg);

      this.logger.log(`Email sent successfully to ${to}`, {
        messageId: response.headers['x-message-id'],
        statusCode: response.statusCode,
      });

      return Result.ok<string>(response.headers['x-message-id'] as string);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, {
        error: error.message,
        stack: error.stack,
      });

      return Result.fail<string>(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Send email using a template
   */
  async sendTemplateEmail(
    to: string,
    templateId: string,
    templateData: Record<string, any>,
  ): Promise<Result<string>> {
    try {
      const msg = {
        to,
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        templateId,
        dynamicTemplateData: templateData,
      };

      const [response] = await sgMail.send(msg);

      this.logger.log(`Template email sent successfully to ${to}`, {
        messageId: response.headers['x-message-id'],
        templateId,
      });

      return Result.ok<string>(response.headers['x-message-id'] as string);
    } catch (error) {
      this.logger.error(`Failed to send template email to ${to}`, {
        error: error.message,
        templateId,
      });

      return Result.fail<string>(`Failed to send template email: ${error.message}`);
    }
  }

  /**
   * Send bulk emails
   */
  async sendBulkEmail(
    emails: Array<{
      to: string;
      subject: string;
      body: string;
      html?: string;
    }>,
  ): Promise<Result<string[]>> {
    try {
      const messages = emails.map((email) => ({
        to: email.to,
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        subject: email.subject,
        text: email.body,
        html: email.html || email.body,
      }));

      const responses = await sgMail.send(messages);

      const messageIds = responses.map(
        ([response]) => response.headers['x-message-id'] as string,
      );

      this.logger.log(`Bulk emails sent successfully`, {
        count: emails.length,
        messageIds,
      });

      return Result.ok<string[]>(messageIds);
    } catch (error) {
      this.logger.error(`Failed to send bulk emails`, {
        error: error.message,
        count: emails.length,
      });

      return Result.fail<string[]>(`Failed to send bulk emails: ${error.message}`);
    }
  }
}
