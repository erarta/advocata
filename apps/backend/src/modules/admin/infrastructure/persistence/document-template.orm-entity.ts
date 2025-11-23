import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum DocumentTemplateCategory {
  CONTRACT = 'contract',
  AGREEMENT = 'agreement',
  STATEMENT = 'statement',
  APPLICATION = 'application',
  POWER_OF_ATTORNEY = 'power_of_attorney',
  COMPLAINT = 'complaint',
  OTHER = 'other',
}

/**
 * DocumentTemplateOrmEntity
 *
 * TypeORM entity for Document Templates
 * Pre-made legal document templates for lawyers
 */
@Entity('document_templates')
export class DocumentTemplateOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: DocumentTemplateCategory,
  })
  @Index()
  category: DocumentTemplateCategory;

  @Column({ type: 'text' })
  content: string; // Template content with placeholders

  @Column({ type: 'jsonb', nullable: true })
  variables: Record<string, any> | null; // Available placeholders/variables

  @Column({ type: 'varchar', length: 20 })
  fileFormat: string; // docx, pdf, txt

  @Column({ type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @Column({ type: 'text', array: true, nullable: true })
  tags: string[] | null;

  @Column({ type: 'int', default: 0 })
  usageCount: number; // How many times this template was used

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
