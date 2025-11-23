import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IOtpService } from '../../domain/services/otp.service.interface';
import Redis from 'ioredis';
import { NotificationService } from '@/modules/notification/application/services/notification.service';

/**
 * OtpService
 *
 * Manages OTP (One-Time Password) generation, storage, and verification
 * Uses Redis for storage and Twilio for SMS delivery via NotificationService
 */
@Injectable()
export class OtpService implements IOtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly redis: Redis;
  private readonly otpExpiration = 5 * 60; // 5 minutes in seconds
  private readonly otpLength = 6;

  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
  ) {
    this.redis = new Redis({
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
      password: this.configService.get('REDIS_PASSWORD'),
    });
  }

  async generate(phoneNumber: string): Promise<string> {
    // Generate random 6-digit code
    const code = this.generateCode();

    // Store in Redis with expiration
    const key = this.getRedisKey(phoneNumber);
    await this.redis.setex(key, this.otpExpiration, code);

    // Send SMS via NotificationService (Twilio)
    await this.sendSms(phoneNumber, code);

    // In development, log the code for testing
    if (this.configService.get('NODE_ENV') === 'development') {
      this.logger.log(`OTP for ${phoneNumber}: ${code}`);
      return code; // Return code in development for testing
    }

    // In production, don't return the actual code (it's sent via SMS)
    return 'sent';
  }

  async verify(phoneNumber: string, code: string): Promise<boolean> {
    const key = this.getRedisKey(phoneNumber);
    const storedCode = await this.redis.get(key);

    if (!storedCode) {
      this.logger.warn(`OTP verification failed: no code found for ${phoneNumber}`);
      return false;
    }

    const isValid = storedCode === code;

    if (!isValid) {
      this.logger.warn(
        `OTP verification failed: invalid code for ${phoneNumber}`,
      );
    }

    return isValid;
  }

  async delete(phoneNumber: string): Promise<void> {
    const key = this.getRedisKey(phoneNumber);
    await this.redis.del(key);
  }

  async resend(phoneNumber: string): Promise<string> {
    // Check if there's a recent OTP (to prevent spam)
    const key = this.getRedisKey(phoneNumber);
    const ttl = await this.redis.ttl(key);

    // If OTP was sent less than 1 minute ago, don't allow resend
    if (ttl > (this.otpExpiration - 60)) {
      throw new Error('Please wait before requesting a new code');
    }

    // Generate and send new code
    return this.generate(phoneNumber);
  }

  /**
   * Generate random numeric code
   */
  private generateCode(): string {
    const min = Math.pow(10, this.otpLength - 1);
    const max = Math.pow(10, this.otpLength) - 1;
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
  }

  /**
   * Get Redis key for phone number
   */
  private getRedisKey(phoneNumber: string): string {
    return `otp:${phoneNumber}`;
  }

  /**
   * Send SMS via NotificationService (Twilio)
   */
  private async sendSms(phoneNumber: string, code: string): Promise<void> {
    try {
      const result = await this.notificationService.sendOtp(phoneNumber, code);

      if (result.isFailure) {
        this.logger.error('Failed to send OTP SMS', {
          phoneNumber,
          error: result.error,
        });
        // In production, you might want to throw an error here
        // For now, we'll just log it and continue
      } else {
        this.logger.log(`OTP SMS queued for sending to ${phoneNumber}`);
      }
    } catch (error) {
      this.logger.error('Error sending OTP SMS', {
        phoneNumber,
        error: error.message,
        stack: error.stack,
      });
      // Don't throw - allow OTP to be stored even if SMS fails
    }
  }
}
