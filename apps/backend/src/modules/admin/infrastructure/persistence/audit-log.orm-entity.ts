import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum AuditAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  VERIFY = 'verify',
  APPROVE = 'approve',
  REJECT = 'reject',
  SUSPEND = 'suspend',
  BAN = 'ban',
  ACTIVATE = 'activate',
  PAYMENT = 'payment',
  REFUND = 'refund',
  PAYOUT = 'payout',
  OTHER = 'other',
}

export enum AuditEntityType {
  USER = 'user',
  LAWYER = 'lawyer',
  CONSULTATION = 'consultation',
  PAYMENT = 'payment',
  PAYOUT = 'payout',
  REFUND = 'refund',
  SUBSCRIPTION = 'subscription',
  LEGAL_PAGE = 'legal_page',
  FAQ = 'faq',
  DOCUMENT_TEMPLATE = 'document_template',
  ONBOARDING_SLIDE = 'onboarding_slide',
  SUPPORT_TICKET = 'support_ticket',
  PLATFORM_CONFIG = 'platform_config',
  FEATURE_FLAG = 'feature_flag',
  ADMIN_ROLE = 'admin_role',
  OTHER = 'other',
}

/**
 * AuditLogOrmEntity
 *
 * TypeORM entity for Audit Logs
 * Comprehensive audit trail for all admin actions
 */
@Entity('audit_logs')
export class AuditLogOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  userId: string; // Admin user who performed the action

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  @Index()
  action: AuditAction;

  @Column({
    type: 'enum',
    enum: AuditEntityType,
  })
  @Index()
  entityType: AuditEntityType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index()
  entityId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  oldValue: Record<string, any> | null;

  @Column({ type: 'jsonb', nullable: true })
  newValue: Record<string, any> | null;

  @Column({ type: 'varchar', length: 45, nullable: true })
  @Index()
  ipAddress: string | null;

  @Column({ type: 'text', nullable: true })
  userAgent: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn()
  @Index()
  createdAt: Date;
}
