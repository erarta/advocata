import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum CommissionType {
  PLATFORM_FEE = 'platform_fee',
  PAYMENT_PROCESSING = 'payment_processing',
  EMERGENCY_CALL = 'emergency_call',
  CONSULTATION = 'consultation',
}

/**
 * CommissionConfigOrmEntity
 *
 * TypeORM entity for Commission Configuration persistence
 * Defines platform commission rates and fee structures
 */
@Entity('commission_configs')
export class CommissionConfigOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: CommissionType,
    unique: true,
  })
  @Index()
  type: CommissionType;

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  rate: number; // e.g., 0.1000 for 10%

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  fixedAmount: number | null; // Fixed fee amount

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minAmount: number | null; // Minimum commission amount

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxAmount: number | null; // Maximum commission amount

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  effectiveFrom: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  effectiveTo: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
