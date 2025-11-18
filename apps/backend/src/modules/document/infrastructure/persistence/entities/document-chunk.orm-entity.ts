import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('document_chunks')
@Index(['documentId'])
export class DocumentChunkOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  documentId: string;

  @Column({ type: 'text' })
  content: string;

  // Vector embedding stored as array of floats
  // Note: In production, use pgvector extension with vector type
  @Column('simple-array')
  embedding: string; // Store as comma-separated string, parse to number[]

  @Column({ type: 'int', nullable: true })
  pageNumber: number;

  @Column({ type: 'int' })
  chunkIndex: number;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
