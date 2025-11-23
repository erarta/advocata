import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum RateLimitType {
  IP = 'ip',
  USER = 'user',
  ENDPOINT = 'endpoint',
  GLOBAL = 'global',
}

/**
 * RateLimitOrmEntity
 *
 * TypeORM entity for Rate Limiting Configuration
 * API rate limiting rules
 */
@Entity('rate_limits')
export class RateLimitOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: RateLimitType,
  })
  @Index()
  type: RateLimitType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  endpoint: string | null; // API endpoint pattern

  @Column({ type: 'int' })
  maxRequests: number; // Maximum number of requests

  @Column({ type: 'int' })
  windowSeconds: number; // Time window in seconds

  @Column({ type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @Column({ type: 'text', array: true, nullable: true })
  exemptIps: string[] | null; // IPs exempt from rate limiting

  @Column({ type: 'text', array: true, nullable: true })
  exemptUsers: string[] | null; // User IDs exempt from rate limiting

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
