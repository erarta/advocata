import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * AdminRoleOrmEntity
 *
 * TypeORM entity for Admin Roles
 * Role-based access control for admin users
 */
@Entity('admin_roles')
export class AdminRoleOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @Index()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text', array: true })
  permissions: string[]; // e.g., ['users:read', 'users:write', 'lawyers:verify']

  @Column({ type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isSystem: boolean; // System roles cannot be deleted

  @Column({ type: 'int', default: 0 })
  level: number; // Hierarchy level (higher = more privileged)

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
