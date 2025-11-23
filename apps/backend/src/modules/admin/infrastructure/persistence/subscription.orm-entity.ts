import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended',
}

export enum SubscriptionTier {
  BASIC = 'basic',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

/**
 * SubscriptionOrmEntity
 *
 * TypeORM entity for Subscription persistence
 * Represents user subscriptions for platform services
 */
@Entity('subscriptions')
export class SubscriptionOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @Column({
    type: 'enum',
    enum: SubscriptionTier,
  })
  @Index()
  tier: SubscriptionTier;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  @Index()
  status: SubscriptionStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monthlyPrice: number;

  @Column({ type: 'varchar', length: 3, default: 'RUB' })
  currency: string;

  @Column({ type: 'timestamp' })
  @Index()
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  @Index()
  endDate: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  @Index()
  nextBillingDate: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  yooKassaSubscriptionId: string | null;

  @Column({ type: 'boolean', default: true })
  autoRenew: boolean;

  @Column({ type: 'jsonb', nullable: true })
  features: Record<string, any> | null;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt: Date | null;

  @Column({ type: 'text', nullable: true })
  cancellationReason: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
