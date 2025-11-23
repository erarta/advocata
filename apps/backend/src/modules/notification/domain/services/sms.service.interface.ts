import { Result } from '@/shared/domain/result';

/**
 * SMS Service Interface
 *
 * Abstraction for SMS service providers (Twilio, etc.)
 */
export interface ISmsService {
  /**
   * Send a single SMS
   */
  sendSms(to: string, message: string): Promise<Result<string>>;

  /**
   * Send bulk SMS
   */
  sendBulkSms(
    messages: Array<{
      to: string;
      message: string;
    }>,
  ): Promise<Result<string[]>>;

  /**
   * Get SMS delivery status
   */
  getDeliveryStatus(messageId: string): Promise<Result<string>>;
}

export const SMS_SERVICE = Symbol('SMS_SERVICE');
