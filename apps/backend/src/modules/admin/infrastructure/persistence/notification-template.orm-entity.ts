import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
}

export enum NotificationTemplateType {
  WELCOME = 'welcome',
  VERIFICATION = 'verification',
  PASSWORD_RESET = 'password_reset',
  CONSULTATION_BOOKED = 'consultation_booked',
  CONSULTATION_REMINDER = 'consultation_reminder',
  CONSULTATION_CANCELLED = 'consultation_cancelled',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed',
  REFUND_PROCESSED = 'refund_processed',
  PAYOUT_PROCESSED = 'payout_processed',
  LAWYER_VERIFIED = 'lawyer_verified',
  LAWYER_REJECTED = 'lawyer_rejected',
  USER_SUSPENDED = 'user_suspended',
  SUBSCRIPTION_RENEWED = 'subscription_renewed',
  SUBSCRIPTION_EXPIRED = 'subscription_expired',
  SUPPORT_TICKET_REPLY = 'support_ticket_reply',
  OTHER = 'other',
}

/**
 * NotificationTemplateOrmEntity
 *
 * TypeORM entity for Notification Templates
 * Email, SMS, and push notification templates
 */
@Entity('notification_templates')
export class NotificationTemplateOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @Index()
  key: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: NotificationTemplateType,
  })
  @Index()
  type: NotificationTemplateType;

  @Column({
    type: 'enum',
    enum: NotificationChannel,
  })
  @Index()
  channel: NotificationChannel;

  @Column({ type: 'varchar', length: 255, nullable: true })
  subject: string | null; // For email

  @Column({ type: 'text' })
  body: string; // Template body with placeholders

  @Column({ type: 'text', array: true, nullable: true })
  variables: string[] | null; // Available template variables

  @Column({ type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @Column({ type: 'varchar', length: 10, default: 'ru' })
  language: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @Column({ type: 'uuid', nullable: true })
  lastModifiedBy: string | null; // Admin user ID

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
