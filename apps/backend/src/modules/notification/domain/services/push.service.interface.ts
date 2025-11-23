import { Result } from '@/shared/domain/result';

/**
 * Push Notification Service Interface
 *
 * Abstraction for push notification providers (Firebase, OneSignal, etc.)
 */
export interface IPushService {
  /**
   * Send push notification to a single device
   */
  sendPush(
    deviceToken: string,
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<Result<string>>;

  /**
   * Send push notification to multiple devices
   */
  sendBulkPush(
    notifications: Array<{
      deviceToken: string;
      title: string;
      body: string;
      data?: Record<string, any>;
    }>,
  ): Promise<Result<string[]>>;

  /**
   * Send push notification to a topic (for broadcast)
   */
  sendTopicPush(
    topic: string,
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<Result<string>>;
}

export const PUSH_SERVICE = Symbol('PUSH_SERVICE');
