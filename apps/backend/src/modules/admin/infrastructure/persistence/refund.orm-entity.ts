import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum RefundStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum RefundReason {
  CUSTOMER_REQUEST = 'customer_request',
  SERVICE_NOT_PROVIDED = 'service_not_provided',
  DUPLICATE_PAYMENT = 'duplicate_payment',
  FRAUDULENT = 'fraudulent',
  OTHER = 'other',
}

/**
 * RefundOrmEntity
 *
 * TypeORM entity for Refund persistence
 * Represents payment refunds for consultations
 */
@Entity('refunds')
export class RefundOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  paymentId: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  consultationId: string | null;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'RUB' })
  currency: string;

  @Column({
    type: 'enum',
    enum: RefundStatus,
    default: RefundStatus.PENDING,
  })
  @Index()
  status: RefundStatus;

  @Column({
    type: 'enum',
    enum: RefundReason,
  })
  reason: RefundReason;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  yooKassaRefundId: string | null;

  @Column({ type: 'text', nullable: true })
  failureReason: string | null;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  approvedBy: string | null; // Admin user ID

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  rejectedBy: string | null; // Admin user ID

  @Column({ type: 'timestamp', nullable: true })
  rejectedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string | null;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
