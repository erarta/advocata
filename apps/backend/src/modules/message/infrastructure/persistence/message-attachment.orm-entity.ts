import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { MessageOrmEntity } from './message.orm-entity';

/**
 * Message Attachment ORM Entity
 *
 * TypeORM entity for message_attachments table.
 * Maps to the database schema created by CreateMessagesTable migration.
 */
@Entity('message_attachments')
export class MessageAttachmentOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  messageId: string;

  @Column('varchar', { length: 500 })
  fileName: string;

  @Column('text')
  fileUrl: string;

  @Column('bigint')
  fileSize: number;

  @Column('varchar', { length: 100 })
  mimeType: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => MessageOrmEntity, (message) => message.attachments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'messageId' })
  message: MessageOrmEntity;
}
