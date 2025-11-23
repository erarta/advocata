import { Injectable, Inject, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Result } from '@/shared/domain/result';
import { SendEmailCommand } from '../commands/send-email/send-email.command';
import { SendSmsCommand } from '../commands/send-sms/send-sms.command';
import { SendPushCommand } from '../commands/send-push/send-push.command';

/**
 * Notification Application Service
 *
 * Unified service for sending notifications through various channels
 */
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly commandBus: CommandBus) {}

  /**
   * Send email notification
   */
  async sendEmail(
    userId: string,
    to: string,
    subject: string,
    body: string,
    html?: string,
    metadata?: Record<string, any>,
  ): Promise<Result<string>> {
    try {
      const command = new SendEmailCommand(
        userId,
        to,
        subject,
        body,
        html,
        undefined,
        undefined,
        metadata,
      );

      const result = await this.commandBus.execute(command);

      return result;
    } catch (error) {
      this.logger.error('Failed to send email', {
        error: error.message,
        userId,
        to,
      });

      return Result.fail<string>(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Send template email
   */
  async sendTemplateEmail(
    userId: string,
    to: string,
    templateId: string,
    templateData: Record<string, any>,
    metadata?: Record<string, any>,
  ): Promise<Result<string>> {
    try {
      const command = new SendEmailCommand(
        userId,
        to,
        '', // Subject from template
        '', // Body from template
        undefined,
        templateId,
        templateData,
        metadata,
      );

      const result = await this.commandBus.execute(command);

      return result;
    } catch (error) {
      this.logger.error('Failed to send template email', {
        error: error.message,
        userId,
        to,
        templateId,
      });

      return Result.fail<string>(`Failed to send template email: ${error.message}`);
    }
  }

  /**
   * Send SMS notification
   */
  async sendSms(
    userId: string,
    to: string,
    message: string,
    metadata?: Record<string, any>,
  ): Promise<Result<string>> {
    try {
      const command = new SendSmsCommand(userId, to, message, metadata);

      const result = await this.commandBus.execute(command);

      return result;
    } catch (error) {
      this.logger.error('Failed to send SMS', {
        error: error.message,
        userId,
        to,
      });

      return Result.fail<string>(`Failed to send SMS: ${error.message}`);
    }
  }

  /**
   * Send push notification
   */
  async sendPush(
    userId: string,
    deviceToken: string,
    title: string,
    body: string,
    data?: Record<string, any>,
    metadata?: Record<string, any>,
  ): Promise<Result<string>> {
    try {
      const command = new SendPushCommand(userId, deviceToken, title, body, data, metadata);

      const result = await this.commandBus.execute(command);

      return result;
    } catch (error) {
      this.logger.error('Failed to send push notification', {
        error: error.message,
        userId,
        title,
      });

      return Result.fail<string>(`Failed to send push notification: ${error.message}`);
    }
  }

  /**
   * Send OTP via SMS
   */
  async sendOtp(phoneNumber: string, code: string): Promise<Result<string>> {
    const message = `Your Advocata verification code is: ${code}. Valid for 5 minutes.`;

    return this.sendSms('system', phoneNumber, message, { type: 'otp', code });
  }

  /**
   * Send consultation confirmation email
   */
  async sendConsultationConfirmation(
    userId: string,
    email: string,
    consultationData: {
      lawyerName: string;
      scheduledTime: Date;
      duration: number;
      specialization: string;
    },
  ): Promise<Result<string>> {
    const subject = 'Consultation Confirmed - Advocata';
    const body = `
Dear Client,

Your consultation has been confirmed with the following details:

Lawyer: ${consultationData.lawyerName}
Specialization: ${consultationData.specialization}
Date & Time: ${consultationData.scheduledTime.toLocaleString('ru-RU')}
Duration: ${consultationData.duration} minutes

Please be ready at the scheduled time. You will receive a notification when the lawyer is ready.

Best regards,
Advocata Team
    `.trim();

    return this.sendEmail(userId, email, subject, body, undefined, {
      type: 'consultation_confirmation',
      consultationId: consultationData,
    });
  }

  /**
   * Send payment receipt email
   */
  async sendPaymentReceipt(
    userId: string,
    email: string,
    paymentData: {
      amount: number;
      currency: string;
      description: string;
      paymentId: string;
    },
  ): Promise<Result<string>> {
    const subject = 'Payment Receipt - Advocata';
    const body = `
Dear Client,

Your payment has been processed successfully.

Amount: ${paymentData.amount} ${paymentData.currency}
Description: ${paymentData.description}
Payment ID: ${paymentData.paymentId}

Thank you for using Advocata!

Best regards,
Advocata Team
    `.trim();

    return this.sendEmail(userId, email, subject, body, undefined, {
      type: 'payment_receipt',
      paymentId: paymentData.paymentId,
    });
  }
}
