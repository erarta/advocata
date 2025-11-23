import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';
import {
  ISmsService,
  SmsNotification,
  SmsResult,
} from '../../domain/interfaces/notification.interface';

/**
 * Twilio SMS Service Implementation
 *
 * Handles sending SMS via Twilio API.
 * Supports single and bulk SMS sending.
 */
@Injectable()
export class TwilioSmsService implements ISmsService {
  private readonly logger = new Logger(TwilioSmsService.name);
  private readonly twilioClient: Twilio | null = null;
  private readonly fromPhone: string;

  constructor(private readonly configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.fromPhone =
      this.configService.get<string>('TWILIO_PHONE_NUMBER') || '+79000000000';

    if (
      !accountSid ||
      !authToken ||
      accountSid === 'placeholder-account-sid' ||
      authToken === 'placeholder-auth-token'
    ) {
      this.logger.warn(
        'Twilio credentials not configured. SMS notifications will be simulated.',
      );
    } else {
      this.twilioClient = new Twilio(accountSid, authToken);
      this.logger.log('Twilio SMS service initialized');
    }
  }

  /**
   * Send a single SMS
   */
  async sendSms(notification: SmsNotification): Promise<SmsResult> {
    try {
      // Validation
      if (!notification.to) {
        return {
          success: false,
          error: 'Recipient phone number is required',
        };
      }

      if (!notification.message || notification.message.trim().length === 0) {
        return {
          success: false,
          error: 'Message content is required',
        };
      }

      // Validate phone number format
      if (!this.isValidPhoneNumber(notification.to)) {
        return {
          success: false,
          error: 'Invalid phone number format. Must start with +7 or +',
        };
      }

      // Check if Twilio is configured
      if (!this.twilioClient) {
        // Simulate SMS sending in development
        this.logger.debug(
          `[SIMULATED] SMS would be sent to: ${notification.to}`,
        );
        this.logger.debug(`[SIMULATED] Message: ${notification.message}`);

        return {
          success: true,
          messageId: `simulated-sms-${Date.now()}`,
        };
      }

      // Send SMS via Twilio
      const message = await this.twilioClient.messages.create({
        body: notification.message,
        from: notification.from || this.fromPhone,
        to: notification.to,
      });

      this.logger.log(`SMS sent successfully to ${notification.to}`);

      return {
        success: true,
        messageId: message.sid,
      };
    } catch (error) {
      this.logger.error('Failed to send SMS via Twilio', error.stack);

      let errorMessage = 'Unknown error';
      if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Send bulk SMS messages
   */
  async sendBulkSms(notifications: SmsNotification[]): Promise<SmsResult[]> {
    const results: SmsResult[] = [];

    // Process in batches to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < notifications.length; i += batchSize) {
      const batch = notifications.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map((notification) => this.sendSms(notification)),
      );
      results.push(...batchResults);

      // Small delay between batches (Twilio rate limit)
      if (i + batchSize < notifications.length) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }

    return results;
  }

  /**
   * Validate phone number format
   * Accepts Russian format (+7...) or international format (+...)
   */
  private isValidPhoneNumber(phoneNumber: string): boolean {
    // Must start with + and have 11-15 digits
    const phoneRegex = /^\+[1-9]\d{10,14}$/;
    return phoneRegex.test(phoneNumber);
  }

  /**
   * Format phone number to E.164 format
   * Converts Russian format to international
   */
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters except +
    let cleaned = phoneNumber.replace(/[^\d+]/g, '');

    // If starts with 8, replace with +7
    if (cleaned.startsWith('8')) {
      cleaned = '+7' + cleaned.substring(1);
    }

    // If starts with 7 (without +), add +
    if (cleaned.startsWith('7') && !cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }

    return cleaned;
  }

  /**
   * Get SMS delivery status
   */
  async getSmsStatus(messageId: string): Promise<string | null> {
    if (!this.twilioClient) {
      return null;
    }

    try {
      const message = await this.twilioClient.messages(messageId).fetch();
      return message.status;
    } catch (error) {
      this.logger.error(`Failed to get SMS status for ${messageId}`, error.stack);
      return null;
    }
  }
}
