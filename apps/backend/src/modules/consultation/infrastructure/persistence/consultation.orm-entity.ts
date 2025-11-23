import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Consultation ORM Entity
 *
 * TypeORM entity for consultations table
 */
@Entity('consultations')
@Index(['clientId', 'status'])
@Index(['lawyerId', 'status'])
@Index(['status'])
export class ConsultationOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  clientId: string;

  @Column('uuid')
  @Index()
  lawyerId: string;

  @Column('varchar', { length: 50 })
  type: string;

  @Column('varchar', { length: 50 })
  @Index()
  status: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('varchar', { length: 10, default: 'RUB' })
  currency: string;

  @Column('timestamp with time zone', { nullable: true })
  scheduledStart: Date | null;

  @Column('timestamp with time zone', { nullable: true })
  scheduledEnd: Date | null;

  @Column('timestamp with time zone', { nullable: true })
  confirmedAt: Date | null;

  @Column('timestamp with time zone', { nullable: true })
  startedAt: Date | null;

  @Column('timestamp with time zone', { nullable: true })
  completedAt: Date | null;

  @Column('timestamp with time zone', { nullable: true })
  cancelledAt: Date | null;

  @Column('int', { nullable: true })
  rating: number | null;

  @Column('text', { nullable: true })
  review: string | null;

  @Column('varchar', { length: 500, nullable: true })
  cancellationReason: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
