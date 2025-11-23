import { Payment } from '../../domain/entities/payment.entity';
import { Money } from '../../domain/value-objects/money.vo';
import { PaymentStatus } from '../../domain/value-objects/payment-status.vo';
import { PaymentMethod } from '../../domain/value-objects/payment-method.vo';
import { PaymentOrmEntity } from './payment.orm-entity';

/**
 * Payment Mapper
 *
 * Maps between Payment domain entity and PaymentOrmEntity (persistence).
 * Follows the Repository pattern for clean architecture.
 */
export class PaymentMapper {
  /**
   * Map ORM entity to Domain entity
   */
  public static toDomain(ormEntity: PaymentOrmEntity): Payment {
    // Create Money value object
    const moneyResult = Money.create({
      amount: Number(ormEntity.amount),
      currency: ormEntity.currency,
    });

    if (moneyResult.isFailure) {
      throw new Error(
        `Failed to map ORM entity to domain: ${moneyResult.error}`,
      );
    }

    const money = moneyResult.getValue();

    // Create refunded amount if present
    let refundedMoney: Money | undefined;
    if (ormEntity.refundedAmount) {
      const refundedMoneyResult = Money.create({
        amount: Number(ormEntity.refundedAmount),
        currency: ormEntity.currency,
      });

      if (refundedMoneyResult.isSuccess) {
        refundedMoney = refundedMoneyResult.getValue();
      }
    }

    // Create payment with minimal required data
    const paymentResult = Payment.create(
      ormEntity.id,
      ormEntity.userId,
      money,
      ormEntity.description,
      ormEntity.consultationId,
      ormEntity.subscriptionId,
      ormEntity.metadata,
    );

    if (paymentResult.isFailure) {
      throw new Error(
        `Failed to map ORM entity to domain: ${paymentResult.error}`,
      );
    }

    const payment = paymentResult.getValue();

    // Set additional properties that aren't set in create()
    (payment as any).props.status = ormEntity.status as PaymentStatus;
    (payment as any).props.method = ormEntity.method as PaymentMethod;
    (payment as any).props.yooKassaPaymentId = ormEntity.yooKassaPaymentId;
    (payment as any).props.yooKassaPaymentUrl = ormEntity.yooKassaPaymentUrl;
    (payment as any).props.refundedAmount = refundedMoney;
    (payment as any).props.failureReason = ormEntity.failureReason;
    (payment as any).props.createdAt = ormEntity.createdAt;
    (payment as any).props.updatedAt = ormEntity.updatedAt;
    (payment as any).props.completedAt = ormEntity.completedAt;
    (payment as any).props.canceledAt = ormEntity.canceledAt;
    (payment as any).props.refundedAt = ormEntity.refundedAt;

    return payment;
  }

  /**
   * Map Domain entity to ORM entity
   */
  public static toOrm(domainEntity: Payment): PaymentOrmEntity {
    const ormEntity = new PaymentOrmEntity();

    ormEntity.id = domainEntity.id;
    ormEntity.userId = domainEntity.userId;
    ormEntity.consultationId = domainEntity.consultationId;
    ormEntity.subscriptionId = domainEntity.subscriptionId;
    ormEntity.amount = domainEntity.amount.amount;
    ormEntity.currency = domainEntity.amount.currency;
    ormEntity.status = domainEntity.status;
    ormEntity.method = domainEntity.method;
    ormEntity.description = domainEntity.description;
    ormEntity.yooKassaPaymentId = domainEntity.yooKassaPaymentId;
    ormEntity.yooKassaPaymentUrl = domainEntity.yooKassaPaymentUrl;
    ormEntity.refundedAmount = domainEntity.refundedAmount?.amount;
    ormEntity.failureReason = domainEntity.failureReason;
    ormEntity.metadata = domainEntity.metadata;
    ormEntity.createdAt = domainEntity.createdAt;
    ormEntity.updatedAt = domainEntity.updatedAt;
    ormEntity.completedAt = domainEntity.completedAt;
    ormEntity.canceledAt = domainEntity.canceledAt;
    ormEntity.refundedAt = domainEntity.refundedAt;

    return ormEntity;
  }

  /**
   * Map multiple ORM entities to Domain entities
   */
  public static toDomainMany(ormEntities: PaymentOrmEntity[]): Payment[] {
    return ormEntities.map((ormEntity) => this.toDomain(ormEntity));
  }

  /**
   * Map multiple Domain entities to ORM entities
   */
  public static toOrmMany(domainEntities: Payment[]): PaymentOrmEntity[] {
    return domainEntities.map((domainEntity) => this.toOrm(domainEntity));
  }
}
