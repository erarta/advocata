import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IPushService } from '../../domain/services/push.service.interface';
import { Result } from '@/shared/domain/result';
import * as admin from 'firebase-admin';

/**
 * Firebase Push Notification Service
 *
 * Implements push notifications using Firebase Cloud Messaging (FCM)
 */
@Injectable()
export class FirebasePushService implements IPushService {
  private readonly logger = new Logger(FirebasePushService.name);
  private readonly enabled: boolean;

  constructor(private readonly configService: ConfigService) {
    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
    const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');

    if (projectId && privateKey && clientEmail) {
      try {
        // Initialize Firebase Admin SDK
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            privateKey: privateKey.replace(/\\n/g, '\n'),
            clientEmail,
          }),
        });

        this.enabled = true;
        this.logger.log('Firebase Admin SDK initialized successfully');
      } catch (error) {
        this.logger.error('Failed to initialize Firebase Admin SDK', {
          error: error.message,
        });
        this.enabled = false;
      }
    } else {
      this.logger.warn('Firebase credentials not configured - Push service disabled');
      this.enabled = false;
    }
  }

  /**
   * Send push notification to a single device
   */
  async sendPush(
    deviceToken: string,
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<Result<string>> {
    if (!this.enabled) {
      this.logger.warn(`Push service disabled - would send to ${deviceToken}: ${title}`);
      return Result.fail<string>('Push service not configured');
    }

    try {
      const message: admin.messaging.Message = {
        token: deviceToken,
        notification: {
          title,
          body,
        },
        data: data ? this.convertDataToStrings(data) : undefined,
      };

      const messageId = await admin.messaging().send(message);

      this.logger.log(`Push notification sent successfully`, {
        messageId,
        deviceToken: deviceToken.substring(0, 20) + '...',
      });

      return Result.ok<string>(messageId);
    } catch (error) {
      this.logger.error(`Failed to send push notification`, {
        error: error.message,
        deviceToken: deviceToken.substring(0, 20) + '...',
      });

      return Result.fail<string>(`Failed to send push notification: ${error.message}`);
    }
  }

  /**
   * Send push notification to multiple devices
   */
  async sendBulkPush(
    notifications: Array<{
      deviceToken: string;
      title: string;
      body: string;
      data?: Record<string, any>;
    }>,
  ): Promise<Result<string[]>> {
    if (!this.enabled) {
      this.logger.warn(`Push service disabled - would send ${notifications.length} notifications`);
      return Result.fail<string[]>('Push service not configured');
    }

    try {
      const messages: admin.messaging.Message[] = notifications.map((notif) => ({
        token: notif.deviceToken,
        notification: {
          title: notif.title,
          body: notif.body,
        },
        data: notif.data ? this.convertDataToStrings(notif.data) : undefined,
      }));

      const response = await admin.messaging().sendEach(messages);

      const messageIds: string[] = [];
      const errors: string[] = [];

      response.responses.forEach((resp, idx) => {
        if (resp.success) {
          messageIds.push(resp.messageId);
        } else {
          errors.push(`Token ${idx}: ${resp.error.message}`);
        }
      });

      if (errors.length > 0) {
        this.logger.warn(`Some push notifications failed`, {
          successCount: messageIds.length,
          failureCount: errors.length,
          errors,
        });
      }

      this.logger.log(`Bulk push notifications sent`, {
        total: notifications.length,
        successful: messageIds.length,
        failed: errors.length,
      });

      return Result.ok<string[]>(messageIds);
    } catch (error) {
      this.logger.error(`Failed to send bulk push notifications`, {
        error: error.message,
        count: notifications.length,
      });

      return Result.fail<string[]>(`Failed to send bulk push notifications: ${error.message}`);
    }
  }

  /**
   * Send push notification to a topic (for broadcast)
   */
  async sendTopicPush(
    topic: string,
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<Result<string>> {
    if (!this.enabled) {
      this.logger.warn(`Push service disabled - would send to topic ${topic}: ${title}`);
      return Result.fail<string>('Push service not configured');
    }

    try {
      const message: admin.messaging.Message = {
        topic,
        notification: {
          title,
          body,
        },
        data: data ? this.convertDataToStrings(data) : undefined,
      };

      const messageId = await admin.messaging().send(message);

      this.logger.log(`Topic push notification sent successfully`, {
        messageId,
        topic,
      });

      return Result.ok<string>(messageId);
    } catch (error) {
      this.logger.error(`Failed to send topic push notification`, {
        error: error.message,
        topic,
      });

      return Result.fail<string>(`Failed to send topic push notification: ${error.message}`);
    }
  }

  /**
   * Convert data object to strings (FCM requirement)
   */
  private convertDataToStrings(data: Record<string, any>): Record<string, string> {
    const result: Record<string, string> = {};

    for (const [key, value] of Object.entries(data)) {
      result[key] = typeof value === 'string' ? value : JSON.stringify(value);
    }

    return result;
  }
}
