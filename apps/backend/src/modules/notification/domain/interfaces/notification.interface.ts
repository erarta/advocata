/**
 * Notification Interfaces
 *
 * Defines contracts for notification services (Email, SMS, Push)
 */

// ==============================================
// EMAIL NOTIFICATION
// ==============================================

export interface EmailNotification {
  to: string | string[];
  from?: string;
  subject: string;
  text?: string;
  html?: string;
  template?: string;
  templateData?: Record<string, any>;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface IEmailService {
  sendEmail(notification: EmailNotification): Promise<EmailResult>;
  sendTemplateEmail(
    to: string | string[],
    templateId: string,
    data: Record<string, any>,
  ): Promise<EmailResult>;
}

// ==============================================
// SMS NOTIFICATION
// ==============================================

export interface SmsNotification {
  to: string;
  message: string;
  from?: string;
}

export interface SmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface ISmsService {
  sendSms(notification: SmsNotification): Promise<SmsResult>;
  sendBulkSms(notifications: SmsNotification[]): Promise<SmsResult[]>;
}

// ==============================================
// PUSH NOTIFICATION
// ==============================================

export interface PushNotification {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
  sound?: string;
  imageUrl?: string;
  actionUrl?: string;
  priority?: 'high' | 'normal';
  ttl?: number; // Time to live in seconds
}

export interface PushResult {
  success: boolean;
  messageId?: string;
  tokensProcessed: number;
  tokensFailed: number;
  error?: string;
}

export interface IPushNotificationService {
  sendPushNotification(notification: PushNotification): Promise<PushResult>;
  sendBulkPushNotification(
    notifications: PushNotification[],
  ): Promise<PushResult[]>;
  subscribeToTopic(userId: string, topic: string): Promise<void>;
  unsubscribeFromTopic(userId: string, topic: string): Promise<void>;
}

// ==============================================
// UNIFIED NOTIFICATION SERVICE
// ==============================================

export interface NotificationPayload {
  userId: string;
  type: NotificationType;
  channels: NotificationChannel[];
  email?: EmailNotification;
  sms?: SmsNotification;
  push?: Omit<PushNotification, 'userId'>;
  priority?: 'high' | 'normal' | 'low';
  scheduledFor?: Date;
}

export enum NotificationType {
  // Auth & User
  WELCOME = 'welcome',
  EMAIL_VERIFICATION = 'email_verification',
  PASSWORD_RESET = 'password_reset',
  ACCOUNT_SUSPENDED = 'account_suspended',

  // Consultation
  CONSULTATION_BOOKED = 'consultation_booked',
  CONSULTATION_REMINDER = 'consultation_reminder',
  CONSULTATION_STARTED = 'consultation_started',
  CONSULTATION_ENDED = 'consultation_ended',
  CONSULTATION_CANCELLED = 'consultation_cancelled',
  CONSULTATION_RESCHEDULED = 'consultation_rescheduled',

  // Lawyer
  LAWYER_VERIFICATION_APPROVED = 'lawyer_verification_approved',
  LAWYER_VERIFICATION_REJECTED = 'lawyer_verification_rejected',
  NEW_CONSULTATION_REQUEST = 'new_consultation_request',
  PAYOUT_PROCESSED = 'payout_processed',

  // Payment
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed',
  REFUND_PROCESSED = 'refund_processed',
  SUBSCRIPTION_STARTED = 'subscription_started',
  SUBSCRIPTION_RENEWED = 'subscription_renewed',
  SUBSCRIPTION_CANCELLED = 'subscription_cancelled',
  SUBSCRIPTION_EXPIRING = 'subscription_expiring',

  // Support
  SUPPORT_TICKET_CREATED = 'support_ticket_created',
  SUPPORT_TICKET_REPLIED = 'support_ticket_replied',
  SUPPORT_TICKET_RESOLVED = 'support_ticket_resolved',

  // System
  MAINTENANCE_MODE = 'maintenance_mode',
  SYSTEM_ALERT = 'system_alert',
}

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
}

export interface NotificationResult {
  success: boolean;
  channelResults: {
    email?: EmailResult;
    sms?: SmsResult;
    push?: PushResult;
  };
  error?: string;
}

export interface INotificationService {
  send(payload: NotificationPayload): Promise<NotificationResult>;
  sendBulk(payloads: NotificationPayload[]): Promise<NotificationResult[]>;
}
