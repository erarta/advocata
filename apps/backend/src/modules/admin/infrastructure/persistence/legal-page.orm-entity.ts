import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum LegalPageType {
  TERMS_OF_SERVICE = 'terms_of_service',
  PRIVACY_POLICY = 'privacy_policy',
  COOKIE_POLICY = 'cookie_policy',
  USER_AGREEMENT = 'user_agreement',
  LAWYER_AGREEMENT = 'lawyer_agreement',
  REFUND_POLICY = 'refund_policy',
  DATA_PROCESSING = 'data_processing',
  OTHER = 'other',
}

export enum LegalPageStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

/**
 * LegalPageOrmEntity
 *
 * TypeORM entity for Legal Information Pages
 * Stores terms of service, privacy policy, etc.
 */
@Entity('legal_pages')
export class LegalPageOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  slug: string;

  @Column({
    type: 'enum',
    enum: LegalPageType,
  })
  @Index()
  type: LegalPageType;

  @Column({ type: 'text' })
  content: string; // Rich text / HTML / Markdown

  @Column({
    type: 'enum',
    enum: LegalPageStatus,
    default: LegalPageStatus.DRAFT,
  })
  @Index()
  status: LegalPageStatus;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  seoTitle: string | null;

  @Column({ type: 'text', nullable: true })
  seoDescription: string | null;

  @Column({ type: 'text', nullable: true })
  seoKeywords: string | null;

  @Column({ type: 'timestamp', nullable: true })
  @Index()
  publishedAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  publishedBy: string | null; // Admin user ID

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
