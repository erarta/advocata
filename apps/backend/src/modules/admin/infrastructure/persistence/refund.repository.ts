import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefundOrmEntity, RefundStatus } from './refund.orm-entity';
import { v4 as uuidv4 } from 'uuid';

/**
 * RefundRepository
 *
 * Repository for Refund entity
 */
@Injectable()
export class RefundRepository {
  constructor(
    @InjectRepository(RefundOrmEntity)
    private readonly repository: Repository<RefundOrmEntity>,
  ) {}

  async nextId(): Promise<string> {
    return uuidv4();
  }

  async findById(id: string): Promise<RefundOrmEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByPaymentId(paymentId: string): Promise<RefundOrmEntity[]> {
    return this.repository.find({
      where: { paymentId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserId(userId: string): Promise<RefundOrmEntity[]> {
    return this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: RefundStatus): Promise<RefundOrmEntity[]> {
    return this.repository.find({
      where: { status },
      order: { createdAt: 'ASC' },
    });
  }

  async findPending(): Promise<RefundOrmEntity[]> {
    return this.findByStatus(RefundStatus.PENDING);
  }

  async findAll(options?: {
    limit?: number;
    offset?: number;
    status?: RefundStatus;
    userId?: string;
  }): Promise<{ refunds: RefundOrmEntity[]; total: number }> {
    const query = this.repository.createQueryBuilder('refund');

    if (options?.status) {
      query.andWhere('refund.status = :status', { status: options.status });
    }

    if (options?.userId) {
      query.andWhere('refund.userId = :userId', { userId: options.userId });
    }

    query.orderBy('refund.createdAt', 'DESC');

    if (options?.limit) {
      query.limit(options.limit);
    }

    if (options?.offset) {
      query.offset(options.offset);
    }

    const [refunds, total] = await query.getManyAndCount();
    return { refunds, total };
  }

  async save(refund: RefundOrmEntity): Promise<RefundOrmEntity> {
    return this.repository.save(refund);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
