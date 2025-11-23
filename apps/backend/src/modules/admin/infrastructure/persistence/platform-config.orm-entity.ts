import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ConfigValueType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  JSON = 'json',
}

/**
 * PlatformConfigOrmEntity
 *
 * TypeORM entity for Platform Configuration
 * Key-value store for platform settings
 */
@Entity('platform_configs')
export class PlatformConfigOrmEntity {
  @PrimaryColumn('varchar', { length: 100 })
  key: string;

  @Column({ type: 'text' })
  value: string;

  @Column({
    type: 'enum',
    enum: ConfigValueType,
    default: ConfigValueType.STRING,
  })
  valueType: ConfigValueType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index()
  category: string | null; // e.g., 'payment', 'notification', 'feature'

  @Column({ type: 'boolean', default: false })
  isSecret: boolean; // Whether value contains sensitive data

  @Column({ type: 'boolean', default: true })
  isEditable: boolean; // Whether admins can edit this

  @Column({ type: 'uuid', nullable: true })
  lastModifiedBy: string | null; // Admin user ID

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
