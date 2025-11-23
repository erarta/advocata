import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum OnboardingAudience {
  CLIENT = 'client',
  LAWYER = 'lawyer',
  BOTH = 'both',
}

/**
 * OnboardingSlideOrmEntity
 *
 * TypeORM entity for Onboarding Slides
 * Introductory slides shown to new users in mobile app
 */
@Entity('onboarding_slides')
export class OnboardingSlideOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl: string | null;

  @Column({
    type: 'enum',
    enum: OnboardingAudience,
  })
  @Index()
  audience: OnboardingAudience;

  @Column({ type: 'int' })
  order: number; // Display order

  @Column({ type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  buttonText: string | null; // e.g., "Next", "Get Started", "Skip"

  @Column({ type: 'varchar', length: 255, nullable: true })
  buttonAction: string | null; // Navigation or action

  @Column({ type: 'varchar', length: 10, default: 'ru' })
  language: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
