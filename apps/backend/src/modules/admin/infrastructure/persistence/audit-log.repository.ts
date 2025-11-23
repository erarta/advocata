import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogOrmEntity, AuditAction, AuditEntityType } from './audit-log.orm-entity';
import { v4 as uuidv4 } from 'uuid';

/**
 * AuditLogRepository
 *
 * Repository for Audit Log entity
 * CRITICAL: Used for compliance and security auditing
 */
@Injectable()
export class AuditLogRepository {
  constructor(
    @InjectRepository(AuditLogOrmEntity)
    private readonly repository: Repository<AuditLogOrmEntity>,
  ) {}

  async nextId(): Promise<string> {
    return uuidv4();
  }

  async findById(id: string): Promise<AuditLogOrmEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByUserId(
    userId: string,
    limit?: number,
  ): Promise<AuditLogOrmEntity[]> {
    const query = this.repository
      .createQueryBuilder('log')
      .where('log.userId = :userId', { userId })
      .orderBy('log.createdAt', 'DESC');

    if (limit) {
      query.limit(limit);
    }

    return query.getMany();
  }

  async findByEntity(
    entityType: AuditEntityType,
    entityId: string,
  ): Promise<AuditLogOrmEntity[]> {
    return this.repository.find({
      where: { entityType, entityId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByAction(action: AuditAction): Promise<AuditLogOrmEntity[]> {
    return this.repository.find({
      where: { action },
      order: { createdAt: 'DESC' },
      take: 1000, // Limit to prevent large queries
    });
  }

  async findAll(options?: {
    limit?: number;
    offset?: number;
    userId?: string;
    action?: AuditAction;
    entityType?: AuditEntityType;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{ logs: AuditLogOrmEntity[]; total: number }> {
    const query = this.repository.createQueryBuilder('log');

    if (options?.userId) {
      query.andWhere('log.userId = :userId', { userId: options.userId });
    }

    if (options?.action) {
      query.andWhere('log.action = :action', { action: options.action });
    }

    if (options?.entityType) {
      query.andWhere('log.entityType = :entityType', {
        entityType: options.entityType,
      });
    }

    if (options?.startDate) {
      query.andWhere('log.createdAt >= :startDate', {
        startDate: options.startDate,
      });
    }

    if (options?.endDate) {
      query.andWhere('log.createdAt <= :endDate', {
        endDate: options.endDate,
      });
    }

    query.orderBy('log.createdAt', 'DESC');

    if (options?.limit) {
      query.limit(options.limit);
    }

    if (options?.offset) {
      query.offset(options.offset);
    }

    const [logs, total] = await query.getManyAndCount();
    return { logs, total };
  }

  async save(log: AuditLogOrmEntity): Promise<AuditLogOrmEntity> {
    return this.repository.save(log);
  }

  /**
   * Create audit log entry
   */
  async create(data: {
    userId: string;
    action: AuditAction;
    entityType: AuditEntityType;
    entityId?: string;
    oldValue?: Record<string, any>;
    newValue?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    description?: string;
    metadata?: Record<string, any>;
  }): Promise<AuditLogOrmEntity> {
    const log = this.repository.create({
      id: await this.nextId(),
      ...data,
    });

    return this.save(log);
  }

  /**
   * Get audit statistics
   */
  async getStatistics(options?: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    totalLogs: number;
    byAction: Record<string, number>;
    byEntityType: Record<string, number>;
  }> {
    const query = this.repository.createQueryBuilder('log');

    if (options?.startDate) {
      query.andWhere('log.createdAt >= :startDate', {
        startDate: options.startDate,
      });
    }

    if (options?.endDate) {
      query.andWhere('log.createdAt <= :endDate', {
        endDate: options.endDate,
      });
    }

    const totalLogs = await query.getCount();

    const byAction = await this.repository
      .createQueryBuilder('log')
      .select('log.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.action')
      .getRawMany();

    const byEntityType = await this.repository
      .createQueryBuilder('log')
      .select('log.entityType', 'entityType')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.entityType')
      .getRawMany();

    return {
      totalLogs,
      byAction: byAction.reduce((acc, item) => {
        acc[item.action] = Number(item.count);
        return acc;
      }, {}),
      byEntityType: byEntityType.reduce((acc, item) => {
        acc[item.entityType] = Number(item.count);
        return acc;
      }, {}),
    };
  }
}
