import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { MessageAttachmentOrmEntity } from './message-attachment.orm-entity';

/**
 * Message ORM Entity
 *
 * TypeORM entity for messages table.
 * Maps to the database schema created by CreateMessagesTable migration.
 */
@Entity('messages')
@Index(['consultationId', 'createdAt'])
@Index(['consultationId', 'status'])
@Index(['senderId'])
export class MessageOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  consultationId: string;

  @Column('uuid')
  @Index()
  senderId: string;

  @Column('varchar', { length: 255, nullable: true })
  senderName: string;

  @Column('text', { nullable: true })
  senderAvatar?: string;

  @Column('text')
  content: string;

  @Column('varchar', { length: 50, default: 'text' })
  type: string;

  @Column('varchar', { length: 50, default: 'sent' })
  @Index()
  status: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  @Index()
  createdAt: Date;

  @Column('timestamp with time zone', { nullable: true })
  deliveredAt?: Date;

  @Column('timestamp with time zone', { nullable: true })
  readAt?: Date;

  @Column('timestamp with time zone', { nullable: true })
  deletedAt?: Date;

  // Relations
  @OneToMany(
    () => MessageAttachmentOrmEntity,
    (attachment) => attachment.message,
    { cascade: true, eager: true },
  )
  attachments: MessageAttachmentOrmEntity[];
}
