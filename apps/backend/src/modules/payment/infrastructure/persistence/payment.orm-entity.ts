import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Payment ORM Entity
 *
 * TypeORM entity for payments table.
 * Maps to the database schema for payment persistence.
 */
@Entity('payments')
@Index(['userId', 'status'])
@Index(['consultationId'])
@Index(['subscriptionId'])
@Index(['yooKassaPaymentId'])
@Index(['status', 'createdAt'])
export class PaymentOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  userId: string;

  @Column('uuid', { nullable: true })
  consultationId?: string;

  @Column('uuid', { nullable: true })
  subscriptionId?: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column('varchar', { length: 10, default: 'RUB' })
  currency: string;

  @Column('varchar', { length: 50, default: 'pending' })
  @Index()
  status: string;

  @Column('varchar', { length: 50, nullable: true })
  method?: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column('varchar', { length: 255, nullable: true, unique: true })
  yooKassaPaymentId?: string;

  @Column('text', { nullable: true })
  yooKassaPaymentUrl?: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  refundedAmount?: number;

  @Column('text', { nullable: true })
  failureReason?: string;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  @Index()
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @Column('timestamp with time zone', { nullable: true })
  completedAt?: Date;

  @Column('timestamp with time zone', { nullable: true })
  canceledAt?: Date;

  @Column('timestamp with time zone', { nullable: true })
  refundedAt?: Date;
}
