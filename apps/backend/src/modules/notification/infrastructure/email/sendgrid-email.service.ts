import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';
import {
  IEmailService,
  EmailNotification,
  EmailResult,
} from '../../domain/interfaces/notification.interface';

/**
 * SendGrid Email Service Implementation
 *
 * Handles sending emails via SendGrid API.
 * Supports plain text, HTML, and template-based emails.
 */
@Injectable()
export class SendGridEmailService implements IEmailService {
  private readonly logger = new Logger(SendGridEmailService.name);
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    this.fromEmail =
      this.configService.get<string>('SENDGRID_FROM_EMAIL') ||
      'noreply@advocata.ru';

    if (!apiKey || apiKey === 'placeholder-sendgrid-api-key') {
      this.logger.warn(
        'SendGrid API key not configured. Email notifications will be simulated.',
      );
    } else {
      sgMail.setApiKey(apiKey);
      this.logger.log('SendGrid email service initialized');
    }
  }

  /**
   * Send a single email
   */
  async sendEmail(notification: EmailNotification): Promise<EmailResult> {
    try {
      // Validation
      if (!notification.to || (Array.isArray(notification.to) && notification.to.length === 0)) {
        return {
          success: false,
          error: 'No recipients specified',
        };
      }

      if (!notification.subject) {
        return {
          success: false,
          error: 'Subject is required',
        };
      }

      if (!notification.text && !notification.html && !notification.template) {
        return {
          success: false,
          error: 'Email content (text, html, or template) is required',
        };
      }

      // Check if API key is configured
      if (
        !this.configService.get<string>('SENDGRID_API_KEY') ||
        this.configService.get<string>('SENDGRID_API_KEY') ===
          'placeholder-sendgrid-api-key'
      ) {
        // Simulate email sending in development
        this.logger.debug(
          `[SIMULATED] Email would be sent to: ${Array.isArray(notification.to) ? notification.to.join(', ') : notification.to}`,
        );
        this.logger.debug(`[SIMULATED] Subject: ${notification.subject}`);
        this.logger.debug(
          `[SIMULATED] Content: ${notification.text || notification.html || 'Template: ' + notification.template}`,
        );

        return {
          success: true,
          messageId: `simulated-${Date.now()}`,
        };
      }

      // Prepare SendGrid message
      const msg: sgMail.MailDataRequired = {
        to: notification.to,
        from: notification.from || this.fromEmail,
        subject: notification.subject,
        text: notification.text,
        html: notification.html,
        attachments: notification.attachments?.map((att) => ({
          filename: att.filename,
          content: att.content.toString('base64'),
          type: att.contentType,
          disposition: 'attachment',
        })),
      };

      // Add template if specified
      if (notification.template) {
        msg.templateId = notification.template;
        if (notification.templateData) {
          msg.dynamicTemplateData = notification.templateData;
        }
      }

      // Send email
      const [response] = await sgMail.send(msg);

      this.logger.log(
        `Email sent successfully to ${Array.isArray(notification.to) ? notification.to.join(', ') : notification.to}`,
      );

      return {
        success: true,
        messageId: response.headers['x-message-id'] || response.statusCode.toString(),
      };
    } catch (error) {
      this.logger.error('Failed to send email via SendGrid', error.stack);

      let errorMessage = 'Unknown error';
      if (error.response && error.response.body) {
        errorMessage = JSON.stringify(error.response.body.errors || error.response.body);
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Send email using SendGrid template
   */
  async sendTemplateEmail(
    to: string | string[],
    templateId: string,
    data: Record<string, any>,
  ): Promise<EmailResult> {
    return this.sendEmail({
      to,
      from: this.fromEmail,
      subject: '', // Subject is defined in template
      template: templateId,
      templateData: data,
    });
  }

  /**
   * Send bulk emails (batch processing)
   */
  async sendBulkEmails(
    notifications: EmailNotification[],
  ): Promise<EmailResult[]> {
    const results: EmailResult[] = [];

    // Process in batches to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < notifications.length; i += batchSize) {
      const batch = notifications.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map((notification) => this.sendEmail(notification)),
      );
      results.push(...batchResults);

      // Small delay between batches
      if (i + batchSize < notifications.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return results;
  }
}
