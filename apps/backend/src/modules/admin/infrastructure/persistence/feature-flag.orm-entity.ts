import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum FeatureFlagEnvironment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  ALL = 'all',
}

/**
 * FeatureFlagOrmEntity
 *
 * TypeORM entity for Feature Flags
 * Toggle features on/off without code deployment
 */
@Entity('feature_flags')
export class FeatureFlagOrmEntity {
  @PrimaryColumn('varchar', { length: 100 })
  key: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'boolean', default: false })
  @Index()
  isEnabled: boolean;

  @Column({
    type: 'enum',
    enum: FeatureFlagEnvironment,
    default: FeatureFlagEnvironment.ALL,
  })
  environment: FeatureFlagEnvironment;

  @Column({ type: 'text', array: true, nullable: true })
  enabledForUsers: string[] | null; // User IDs for gradual rollout

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  rolloutPercentage: number | null; // 0-100, null means all users

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @Column({ type: 'uuid', nullable: true })
  lastModifiedBy: string | null; // Admin user ID

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
