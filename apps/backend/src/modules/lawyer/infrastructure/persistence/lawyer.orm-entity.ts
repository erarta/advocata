import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import {
  SpecializationType,
  LawyerStatus,
  VerificationStatus,
} from '../../domain/enums';

/**
 * LawyerOrmEntity
 *
 * TypeORM entity for Lawyer persistence
 */
@Entity('lawyers')
export class LawyerOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @Column({ type: 'varchar', length: 30, unique: true })
  @Index()
  licenseNumber: string;

  @Column({ type: 'simple-array' })
  specializations: string[];

  @Column({ type: 'int' })
  experienceYears: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  ratingValue: number;

  @Column({ type: 'int', default: 0 })
  reviewCount: number;

  @Column({ type: 'text' })
  bio: string;

  @Column({ type: 'text' })
  education: string;

  @Column({
    type: 'enum',
    enum: LawyerStatus,
    default: LawyerStatus.PendingVerification,
  })
  @Index()
  status: LawyerStatus;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.NotSubmitted,
  })
  @Index()
  verificationStatus: VerificationStatus;

  @Column({ type: 'text', nullable: true })
  verificationNotes: string | null;

  @Column({ type: 'int', nullable: true })
  hourlyRate: number | null;

  @Column({ type: 'boolean', default: false })
  @Index()
  isAvailable: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
