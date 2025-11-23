import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Create Refunds Table Migration
 */
export class CreateRefundsTable1732400000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'refunds',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'paymentId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'consultationId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '3',
            default: "'RUB'",
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'pending'",
            comment: 'pending, approved, rejected, processing, completed, failed',
          },
          {
            name: 'reason',
            type: 'varchar',
            length: '100',
            isNullable: false,
            comment: 'customer_request, service_not_provided, duplicate_payment, fraudulent, other',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'yooKassaRefundId',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'failureReason',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'approvedBy',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'approvedAt',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'rejectedBy',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'rejectedAt',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'rejectionReason',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'completedAt',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.createIndex('refunds', new TableIndex({ name: 'IDX_REFUNDS_PAYMENT_ID', columnNames: ['paymentId'] }));
    await queryRunner.createIndex('refunds', new TableIndex({ name: 'IDX_REFUNDS_CONSULTATION_ID', columnNames: ['consultationId'] }));
    await queryRunner.createIndex('refunds', new TableIndex({ name: 'IDX_REFUNDS_USER_ID', columnNames: ['userId'] }));
    await queryRunner.createIndex('refunds', new TableIndex({ name: 'IDX_REFUNDS_STATUS', columnNames: ['status'] }));
    await queryRunner.createIndex('refunds', new TableIndex({ name: 'IDX_REFUNDS_APPROVED_BY', columnNames: ['approvedBy'] }));

    // Add foreign keys
    await queryRunner.createForeignKey(
      'refunds',
      new TableForeignKey({
        name: 'FK_REFUNDS_PAYMENT',
        columnNames: ['paymentId'],
        referencedTableName: 'payments',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'refunds',
      new TableForeignKey({
        name: 'FK_REFUNDS_CONSULTATION',
        columnNames: ['consultationId'],
        referencedTableName: 'consultations',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // Add constraint
    await queryRunner.query(`
      ALTER TABLE refunds
      ADD CONSTRAINT CHK_REFUND_AMOUNT_POSITIVE
      CHECK (amount > 0)
    `);

    console.log('✅ Created refunds table');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('refunds', 'FK_REFUNDS_PAYMENT');
    await queryRunner.dropForeignKey('refunds', 'FK_REFUNDS_CONSULTATION');
    await queryRunner.dropTable('refunds');
    console.log('✅ Dropped refunds table');
  }
}
