import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayoutOrmEntity, PayoutStatus } from './payout.orm-entity';
import { v4 as uuidv4 } from 'uuid';

/**
 * PayoutRepository
 *
 * Repository for Payout entity
 */
@Injectable()
export class PayoutRepository {
  constructor(
    @InjectRepository(PayoutOrmEntity)
    private readonly repository: Repository<PayoutOrmEntity>,
  ) {}

  async nextId(): Promise<string> {
    return uuidv4();
  }

  async findById(id: string): Promise<PayoutOrmEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByLawyerId(
    lawyerId: string,
    limit?: number,
  ): Promise<PayoutOrmEntity[]> {
    const query = this.repository
      .createQueryBuilder('payout')
      .where('payout.lawyerId = :lawyerId', { lawyerId })
      .orderBy('payout.createdAt', 'DESC');

    if (limit) {
      query.limit(limit);
    }

    return query.getMany();
  }

  async findByStatus(status: PayoutStatus): Promise<PayoutOrmEntity[]> {
    return this.repository.find({
      where: { status },
      order: { createdAt: 'ASC' },
    });
  }

  async findPending(): Promise<PayoutOrmEntity[]> {
    return this.findByStatus(PayoutStatus.PENDING);
  }

  async findAll(options?: {
    limit?: number;
    offset?: number;
    status?: PayoutStatus;
    lawyerId?: string;
  }): Promise<{ payouts: PayoutOrmEntity[]; total: number }> {
    const query = this.repository.createQueryBuilder('payout');

    if (options?.status) {
      query.andWhere('payout.status = :status', { status: options.status });
    }

    if (options?.lawyerId) {
      query.andWhere('payout.lawyerId = :lawyerId', {
        lawyerId: options.lawyerId,
      });
    }

    query.orderBy('payout.createdAt', 'DESC');

    if (options?.limit) {
      query.limit(options.limit);
    }

    if (options?.offset) {
      query.offset(options.offset);
    }

    const [payouts, total] = await query.getManyAndCount();
    return { payouts, total };
  }

  async save(payout: PayoutOrmEntity): Promise<PayoutOrmEntity> {
    return this.repository.save(payout);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async getTotalPaidToLawyer(lawyerId: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('payout')
      .select('SUM(payout.amount)', 'total')
      .where('payout.lawyerId = :lawyerId', { lawyerId })
      .andWhere('payout.status = :status', { status: PayoutStatus.COMPLETED })
      .getRawOne();

    return Number(result?.total || 0);
  }
}
