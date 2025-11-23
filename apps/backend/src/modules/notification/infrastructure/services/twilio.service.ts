import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ISmsService } from '../../domain/services/sms.service.interface';
import { Result } from '@/shared/domain/result';
import { Twilio } from 'twilio';

/**
 * Twilio SMS Service
 *
 * Implements SMS sending using Twilio API
 */
@Injectable()
export class TwilioService implements ISmsService {
  private readonly logger = new Logger(TwilioService.name);
  private readonly client: Twilio;
  private readonly phoneNumber: string;
  private readonly enabled: boolean;

  constructor(private readonly configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.phoneNumber = this.configService.get<string>('TWILIO_PHONE_NUMBER', '');

    if (accountSid && authToken) {
      this.client = new Twilio(accountSid, authToken);
      this.enabled = true;
    } else {
      this.logger.warn('Twilio credentials not configured - SMS service disabled');
      this.enabled = false;
    }
  }

  /**
   * Send a single SMS
   */
  async sendSms(to: string, message: string): Promise<Result<string>> {
    if (!this.enabled) {
      this.logger.warn(`SMS service disabled - would send to ${to}: ${message}`);
      return Result.fail<string>('SMS service not configured');
    }

    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.phoneNumber,
        to,
      });

      this.logger.log(`SMS sent successfully to ${to}`, {
        messageSid: result.sid,
        status: result.status,
      });

      return Result.ok<string>(result.sid);
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${to}`, {
        error: error.message,
        stack: error.stack,
      });

      return Result.fail<string>(`Failed to send SMS: ${error.message}`);
    }
  }

  /**
   * Send bulk SMS
   */
  async sendBulkSms(
    messages: Array<{
      to: string;
      message: string;
    }>,
  ): Promise<Result<string[]>> {
    if (!this.enabled) {
      this.logger.warn(`SMS service disabled - would send ${messages.length} messages`);
      return Result.fail<string[]>('SMS service not configured');
    }

    try {
      const promises = messages.map((msg) =>
        this.client.messages.create({
          body: msg.message,
          from: this.phoneNumber,
          to: msg.to,
        }),
      );

      const results = await Promise.all(promises);

      const messageSids = results.map((result) => result.sid);

      this.logger.log(`Bulk SMS sent successfully`, {
        count: messages.length,
        messageSids,
      });

      return Result.ok<string[]>(messageSids);
    } catch (error) {
      this.logger.error(`Failed to send bulk SMS`, {
        error: error.message,
        count: messages.length,
      });

      return Result.fail<string[]>(`Failed to send bulk SMS: ${error.message}`);
    }
  }

  /**
   * Get SMS delivery status
   */
  async getDeliveryStatus(messageId: string): Promise<Result<string>> {
    if (!this.enabled) {
      return Result.fail<string>('SMS service not configured');
    }

    try {
      const message = await this.client.messages(messageId).fetch();

      this.logger.log(`SMS status retrieved`, {
        messageSid: messageId,
        status: message.status,
      });

      return Result.ok<string>(message.status);
    } catch (error) {
      this.logger.error(`Failed to get SMS status`, {
        error: error.message,
        messageId,
      });

      return Result.fail<string>(`Failed to get SMS status: ${error.message}`);
    }
  }
}
