import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Notification ORM Entity
 *
 * TypeORM entity for persisting notifications to the database
 */
@Entity('notifications')
@Index(['userId', 'createdAt'])
@Index(['status', 'createdAt'])
@Index(['type', 'status'])
export class NotificationOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId: string;

  @Column({ type: 'varchar', length: 20 })
  type: string; // email, sms, push

  @Column({ type: 'varchar', length: 20 })
  status: string; // pending, sent, delivered, failed, bounced

  @Column({ type: 'varchar', length: 255 })
  recipient: string; // Email address, phone number, or device token

  @Column({ type: 'varchar', length: 255, nullable: true })
  subject?: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ name: 'template_id', type: 'varchar', length: 100, nullable: true })
  templateId?: string;

  @Column({ name: 'template_data', type: 'jsonb', nullable: true })
  templateData?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  error?: string;

  @Column({ name: 'external_id', type: 'varchar', length: 255, nullable: true })
  externalId?: string;

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt?: Date;

  @Column({ name: 'delivered_at', type: 'timestamp', nullable: true })
  deliveredAt?: Date;

  @Column({ name: 'failed_at', type: 'timestamp', nullable: true })
  failedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
