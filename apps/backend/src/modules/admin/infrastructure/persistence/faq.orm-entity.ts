import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum FaqCategory {
  GENERAL = 'general',
  LAWYERS = 'lawyers',
  CLIENTS = 'clients',
  PAYMENTS = 'payments',
  CONSULTATIONS = 'consultations',
  TECHNICAL = 'technical',
  LEGAL = 'legal',
}

/**
 * FaqOrmEntity
 *
 * TypeORM entity for FAQ entries
 * Frequently Asked Questions for users and lawyers
 */
@Entity('faqs')
export class FaqOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 500 })
  question: string;

  @Column({ type: 'text' })
  answer: string;

  @Column({
    type: 'enum',
    enum: FaqCategory,
    default: FaqCategory.GENERAL,
  })
  @Index()
  category: FaqCategory;

  @Column({ type: 'int', default: 0 })
  order: number; // Display order within category

  @Column({ type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'int', default: 0 })
  helpfulCount: number; // How many users found this helpful

  @Column({ type: 'text', array: true, nullable: true })
  tags: string[] | null;

  @Column({ type: 'varchar', length: 10, default: 'ru' })
  language: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
