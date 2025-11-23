import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionOrmEntity, SubscriptionStatus } from './subscription.orm-entity';
import { v4 as uuidv4 } from 'uuid';

/**
 * SubscriptionRepository
 *
 * Repository for Subscription entity
 */
@Injectable()
export class SubscriptionRepository {
  constructor(
    @InjectRepository(SubscriptionOrmEntity)
    private readonly repository: Repository<SubscriptionOrmEntity>,
  ) {}

  async nextId(): Promise<string> {
    return uuidv4();
  }

  async findById(id: string): Promise<SubscriptionOrmEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByUserId(userId: string): Promise<SubscriptionOrmEntity[]> {
    return this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findActiveByUserId(userId: string): Promise<SubscriptionOrmEntity | null> {
    return this.repository.findOne({
      where: { userId, status: SubscriptionStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: SubscriptionStatus): Promise<SubscriptionOrmEntity[]> {
    return this.repository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }

  async findExpiring(days: number = 7): Promise<SubscriptionOrmEntity[]> {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    return this.repository
      .createQueryBuilder('subscription')
      .where('subscription.status = :status', { status: SubscriptionStatus.ACTIVE })
      .andWhere('subscription.nextBillingDate <= :expiryDate', { expiryDate })
      .andWhere('subscription.autoRenew = :autoRenew', { autoRenew: false })
      .orderBy('subscription.nextBillingDate', 'ASC')
      .getMany();
  }

  async findAll(options?: {
    limit?: number;
    offset?: number;
    status?: SubscriptionStatus;
  }): Promise<{ subscriptions: SubscriptionOrmEntity[]; total: number }> {
    const query = this.repository.createQueryBuilder('subscription');

    if (options?.status) {
      query.andWhere('subscription.status = :status', { status: options.status });
    }

    query.orderBy('subscription.createdAt', 'DESC');

    if (options?.limit) {
      query.limit(options.limit);
    }

    if (options?.offset) {
      query.offset(options.offset);
    }

    const [subscriptions, total] = await query.getManyAndCount();
    return { subscriptions, total };
  }

  async save(subscription: SubscriptionOrmEntity): Promise<SubscriptionOrmEntity> {
    return this.repository.save(subscription);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
