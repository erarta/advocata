import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum EmailProvider {
  SENDGRID = 'sendgrid',
  MAILGUN = 'mailgun',
  SMTP = 'smtp',
}

/**
 * EmailConfigOrmEntity
 *
 * TypeORM entity for Email Configuration
 * Email provider settings
 */
@Entity('email_configs')
export class EmailConfigOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: EmailProvider,
    default: EmailProvider.SENDGRID,
  })
  provider: EmailProvider;

  @Column({ type: 'varchar', length: 255 })
  fromEmail: string;

  @Column({ type: 'varchar', length: 255 })
  fromName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  replyToEmail: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  apiKey: string | null; // Encrypted

  @Column({ type: 'varchar', length: 255, nullable: true })
  smtpHost: string | null;

  @Column({ type: 'int', nullable: true })
  smtpPort: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  smtpUsername: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  smtpPassword: string | null; // Encrypted

  @Column({ type: 'boolean', default: false })
  smtpSecure: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
