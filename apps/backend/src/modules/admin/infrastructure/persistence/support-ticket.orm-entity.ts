import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum TicketStatus {
  OPEN = 'open',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  WAITING_FOR_CUSTOMER = 'waiting_for_customer',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum TicketCategory {
  TECHNICAL = 'technical',
  BILLING = 'billing',
  ACCOUNT = 'account',
  CONSULTATION = 'consultation',
  LAWYER_VERIFICATION = 'lawyer_verification',
  COMPLAINT = 'complaint',
  FEATURE_REQUEST = 'feature_request',
  OTHER = 'other',
}

/**
 * SupportTicketOrmEntity
 *
 * TypeORM entity for Support Tickets
 * Customer support tickets and admin responses
 */
@Entity('support_tickets')
export class SupportTicketOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  subject: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: TicketCategory,
  })
  @Index()
  category: TicketCategory;

  @Column({
    type: 'enum',
    enum: TicketPriority,
    default: TicketPriority.MEDIUM,
  })
  @Index()
  priority: TicketPriority;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.OPEN,
  })
  @Index()
  status: TicketStatus;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  assignedTo: string | null; // Admin user ID

  @Column({ type: 'timestamp', nullable: true })
  assignedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  closedAt: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  messages: Array<{
    id: string;
    userId: string;
    message: string;
    isAdminReply: boolean;
    createdAt: string;
  }> | null;

  @Column({ type: 'text', array: true, nullable: true })
  attachments: string[] | null; // URLs to attachments

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
