import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

/**
 * Emergency Call ORM Entity
 * TypeORM entity for emergency_calls table
 */
@Entity('emergency_calls')
export class EmergencyCallOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'user_id' })
  userId: string;

  @Column('uuid', { name: 'lawyer_id', nullable: true })
  lawyerId: string | null;

  @Column('double precision')
  latitude: number;

  @Column('double precision')
  longitude: number;

  @Column('text')
  address: string;

  @Column('varchar', { length: 20, default: 'pending' })
  status: string;

  @Column('text', { nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @Column('timestamp with time zone', { name: 'accepted_at', nullable: true })
  acceptedAt: Date | null;

  @Column('timestamp with time zone', { name: 'completed_at', nullable: true })
  completedAt: Date | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
