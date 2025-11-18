import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Create Payments Table Migration
 *
 * Creates the payments table for storing payment transactions.
 * Integrates with YooKassa payment gateway.
 */
export class CreatePaymentsTable1700000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension if not already enabled
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create payments table
    await queryRunner.createTable(
      new Table({
        name: 'payments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: false,
            comment: 'User who made the payment',
          },
          {
            name: 'consultationId',
            type: 'uuid',
            isNullable: true,
            comment: 'Associated consultation (for consultation payments)',
          },
          {
            name: 'subscriptionId',
            type: 'uuid',
            isNullable: true,
            comment: 'Associated subscription (for subscription payments)',
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
            comment: 'Payment amount',
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '10',
            default: "'RUB'",
            comment: 'Currency code (RUB, USD, EUR)',
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'pending'",
            comment:
              'Payment status (pending, waiting_for_capture, succeeded, canceled, failed, refunded)',
          },
          {
            name: 'method',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment:
              'Payment method (bank_card, yoo_money, sber_pay, etc.)',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
            comment: 'Payment description',
          },
          {
            name: 'yooKassaPaymentId',
            type: 'varchar',
            length: '255',
            isNullable: true,
            isUnique: true,
            comment: 'YooKassa payment ID',
          },
          {
            name: 'yooKassaPaymentUrl',
            type: 'text',
            isNullable: true,
            comment: 'YooKassa payment confirmation URL',
          },
          {
            name: 'refundedAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
            comment: 'Total refunded amount',
          },
          {
            name: 'failureReason',
            type: 'text',
            isNullable: true,
            comment: 'Reason for payment failure',
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
            comment: 'Additional metadata',
          },
          {
            name: 'createdAt',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            comment: 'Payment creation timestamp',
          },
          {
            name: 'updatedAt',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            comment: 'Payment last update timestamp',
          },
          {
            name: 'completedAt',
            type: 'timestamp with time zone',
            isNullable: true,
            comment: 'Payment completion timestamp',
          },
          {
            name: 'canceledAt',
            type: 'timestamp with time zone',
            isNullable: true,
            comment: 'Payment cancellation timestamp',
          },
          {
            name: 'refundedAt',
            type: 'timestamp with time zone',
            isNullable: true,
            comment: 'Payment refund timestamp',
          },
        ],
      }),
      true,
    );

    // Create indexes for performance
    await queryRunner.createIndex(
      'payments',
      new TableIndex({
        name: 'IDX_PAYMENTS_USER_ID',
        columnNames: ['userId'],
      }),
    );

    await queryRunner.createIndex(
      'payments',
      new TableIndex({
        name: 'IDX_PAYMENTS_USER_STATUS',
        columnNames: ['userId', 'status'],
      }),
    );

    await queryRunner.createIndex(
      'payments',
      new TableIndex({
        name: 'IDX_PAYMENTS_CONSULTATION_ID',
        columnNames: ['consultationId'],
      }),
    );

    await queryRunner.createIndex(
      'payments',
      new TableIndex({
        name: 'IDX_PAYMENTS_SUBSCRIPTION_ID',
        columnNames: ['subscriptionId'],
      }),
    );

    await queryRunner.createIndex(
      'payments',
      new TableIndex({
        name: 'IDX_PAYMENTS_YOOKASSA_PAYMENT_ID',
        columnNames: ['yooKassaPaymentId'],
      }),
    );

    await queryRunner.createIndex(
      'payments',
      new TableIndex({
        name: 'IDX_PAYMENTS_STATUS',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'payments',
      new TableIndex({
        name: 'IDX_PAYMENTS_STATUS_CREATED',
        columnNames: ['status', 'createdAt'],
      }),
    );

    await queryRunner.createIndex(
      'payments',
      new TableIndex({
        name: 'IDX_PAYMENTS_CREATED_AT',
        columnNames: ['createdAt'],
      }),
    );

    // Create foreign key to consultations table
    await queryRunner.createForeignKey(
      'payments',
      new TableForeignKey({
        name: 'FK_PAYMENTS_CONSULTATION',
        columnNames: ['consultationId'],
        referencedTableName: 'consultations',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL', // Keep payment record if consultation is deleted
      }),
    );

    // Add check constraint: either consultationId or subscriptionId must be provided
    await queryRunner.query(`
      ALTER TABLE payments
      ADD CONSTRAINT CHK_PAYMENT_TYPE
      CHECK (
        ("consultationId" IS NOT NULL AND "subscriptionId" IS NULL) OR
        ("consultationId" IS NULL AND "subscriptionId" IS NOT NULL)
      )
    `);

    // Add check constraint: amount must be positive
    await queryRunner.query(`
      ALTER TABLE payments
      ADD CONSTRAINT CHK_PAYMENT_AMOUNT_POSITIVE
      CHECK (amount > 0)
    `);

    // Add check constraint: refundedAmount cannot exceed amount
    await queryRunner.query(`
      ALTER TABLE payments
      ADD CONSTRAINT CHK_PAYMENT_REFUND_AMOUNT
      CHECK ("refundedAmount" IS NULL OR "refundedAmount" <= amount)
    `);

    console.log('✅ Created payments table with 8 indexes and foreign keys');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.dropForeignKey('payments', 'FK_PAYMENTS_CONSULTATION');

    // Drop table (indexes will be dropped automatically)
    await queryRunner.dropTable('payments');

    console.log('✅ Dropped payments table');
  }
}
