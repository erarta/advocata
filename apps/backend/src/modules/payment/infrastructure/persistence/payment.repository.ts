import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan, Between } from 'typeorm';
import {
  IPaymentRepository,
  PaginatedPayments,
} from '../../domain/repositories/payment.repository.interface';
import { Payment } from '../../domain/entities/payment.entity';
import { PaymentStatus } from '../../domain/value-objects/payment-status.vo';
import { PaymentOrmEntity } from './payment.orm-entity';
import { PaymentMapper } from './payment.mapper';

/**
 * Payment Repository Implementation
 *
 * TypeORM implementation of IPaymentRepository.
 * Handles persistence operations for payments.
 */
@Injectable()
export class PaymentRepository implements IPaymentRepository {
  constructor(
    @InjectRepository(PaymentOrmEntity)
    private readonly repository: Repository<PaymentOrmEntity>,
  ) {}

  /**
   * Find payment by ID
   */
  async findById(id: string): Promise<Payment | null> {
    const ormEntity = await this.repository.findOne({
      where: { id },
    });

    return ormEntity ? PaymentMapper.toDomain(ormEntity) : null;
  }

  /**
   * Find payment by YooKassa payment ID
   */
  async findByYooKassaPaymentId(
    yooKassaPaymentId: string,
  ): Promise<Payment | null> {
    const ormEntity = await this.repository.findOne({
      where: { yooKassaPaymentId },
    });

    return ormEntity ? PaymentMapper.toDomain(ormEntity) : null;
  }

  /**
   * Find payments for a user
   */
  async findByUserId(
    userId: string,
    status?: PaymentStatus,
    limit: number = 50,
    offset: number = 0,
  ): Promise<PaginatedPayments> {
    const query = this.repository
      .createQueryBuilder('payment')
      .where('payment.userId = :userId', { userId });

    if (status) {
      query.andWhere('payment.status = :status', { status });
    }

    query.orderBy('payment.createdAt', 'DESC');
    query.limit(limit).offset(offset);

    const [ormEntities, total] = await query.getManyAndCount();

    return {
      items: PaymentMapper.toDomainMany(ormEntities),
      total,
    };
  }

  /**
   * Find payment for a consultation
   */
  async findByConsultationId(consultationId: string): Promise<Payment | null> {
    const ormEntity = await this.repository.findOne({
      where: { consultationId },
      order: { createdAt: 'DESC' },
    });

    return ormEntity ? PaymentMapper.toDomain(ormEntity) : null;
  }

  /**
   * Find payments for a subscription
   */
  async findBySubscriptionId(
    subscriptionId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<PaginatedPayments> {
    const query = this.repository
      .createQueryBuilder('payment')
      .where('payment.subscriptionId = :subscriptionId', { subscriptionId })
      .orderBy('payment.createdAt', 'DESC')
      .limit(limit)
      .offset(offset);

    const [ormEntities, total] = await query.getManyAndCount();

    return {
      items: PaymentMapper.toDomainMany(ormEntities),
      total,
    };
  }

  /**
   * Find pending payments (for timeout checking)
   */
  async findPendingPayments(
    olderThanMinutes?: number,
    limit: number = 100,
  ): Promise<Payment[]> {
    const query = this.repository
      .createQueryBuilder('payment')
      .where('payment.status = :status', { status: PaymentStatus.PENDING });

    if (olderThanMinutes) {
      const cutoffTime = new Date(Date.now() - olderThanMinutes * 60 * 1000);
      query.andWhere('payment.createdAt < :cutoffTime', { cutoffTime });
    }

    query.orderBy('payment.createdAt', 'ASC').limit(limit);

    const ormEntities = await query.getMany();

    return PaymentMapper.toDomainMany(ormEntities);
  }

  /**
   * Calculate total revenue for a period
   */
  async calculateRevenue(
    startDate: Date,
    endDate: Date,
    currency: string = 'RUB',
  ): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.status = :status', { status: PaymentStatus.SUCCEEDED })
      .andWhere('payment.currency = :currency', { currency })
      .andWhere('payment.completedAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getRawOne();

    return Number(result?.total || 0);
  }

  /**
   * Calculate platform commission for a period
   */
  async calculatePlatformCommission(
    startDate: Date,
    endDate: Date,
    currency: string = 'RUB',
  ): Promise<number> {
    const totalRevenue = await this.calculateRevenue(
      startDate,
      endDate,
      currency,
    );

    // Platform takes 10% commission
    return totalRevenue * 0.1;
  }

  /**
   * Get payment statistics for a user
   */
  async getUserPaymentStats(userId: string): Promise<{
    totalPaid: number;
    totalConsultations: number;
    averagePayment: number;
    currency: string;
  }> {
    const result = await this.repository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'totalPaid')
      .addSelect('COUNT(payment.id)', 'totalConsultations')
      .addSelect('AVG(payment.amount)', 'averagePayment')
      .addSelect('payment.currency', 'currency')
      .where('payment.userId = :userId', { userId })
      .andWhere('payment.status = :status', { status: PaymentStatus.SUCCEEDED })
      .groupBy('payment.currency')
      .getRawOne();

    return {
      totalPaid: Number(result?.totalPaid || 0),
      totalConsultations: Number(result?.totalConsultations || 0),
      averagePayment: Number(result?.averagePayment || 0),
      currency: result?.currency || 'RUB',
    };
  }

  /**
   * Save a payment
   */
  async save(payment: Payment): Promise<void> {
    const ormEntity = PaymentMapper.toOrm(payment);
    await this.repository.save(ormEntity);
  }

  /**
   * Save multiple payments (bulk operation)
   */
  async saveMany(payments: Payment[]): Promise<void> {
    const ormEntities = PaymentMapper.toOrmMany(payments);
    await this.repository.save(ormEntities);
  }

  /**
   * Delete a payment (hard delete - use with caution)
   */
  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  /**
   * Count payments by status
   */
  async countByStatus(
    status: PaymentStatus,
    startDate?: Date,
    endDate?: Date,
  ): Promise<number> {
    const query = this.repository
      .createQueryBuilder('payment')
      .where('payment.status = :status', { status });

    if (startDate && endDate) {
      query.andWhere('payment.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    return await query.getCount();
  }
}
