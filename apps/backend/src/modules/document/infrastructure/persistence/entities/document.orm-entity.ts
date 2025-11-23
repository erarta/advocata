import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { DocumentType, DocumentStatus, DocumentCategory } from '../../../domain/entities/document.entity';

@Entity('documents')
@Index(['lawyerId', 'status'])
@Index(['category', 'isPublic'])
@Index(['createdAt'])
export class DocumentOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  lawyerId: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255 })
  fileName: string;

  @Column({ type: 'text' })
  fileUrl: string;

  @Column({ type: 'bigint' })
  fileSize: number;

  @Column({ type: 'varchar', length: 100 })
  mimeType: string;

  @Column({
    type: 'enum',
    enum: DocumentType,
  })
  type: DocumentType;

  @Column({
    type: 'enum',
    enum: DocumentCategory,
  })
  category: DocumentCategory;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PENDING,
  })
  @Index()
  status: DocumentStatus;

  @Column({ type: 'boolean', default: false })
  @Index()
  isPublic: boolean;

  @Column('simple-array')
  tags: string[];

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'int', nullable: true })
  chunkCount: number;

  @Column({ type: 'int', default: 0 })
  @Index()
  downloadCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
