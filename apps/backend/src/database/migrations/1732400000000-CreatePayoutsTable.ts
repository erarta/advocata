import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Create Payouts Table Migration
 *
 * Creates the payouts table for lawyer payouts
 */
export class CreatePayoutsTable1732400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.createTable(
      new Table({
        name: 'payouts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'lawyerId',
            type: 'uuid',
            isNullable: false,
            comment: 'Lawyer receiving the payout',
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
            comment: 'Payout amount',
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
            comment: 'pending, processing, completed, failed, cancelled',
          },
          {
            name: 'method',
            type: 'varchar',
            length: '50',
            isNullable: false,
            comment: 'bank_transfer, yookassa, card',
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'transactionId',
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
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'processedBy',
            type: 'uuid',
            isNullable: true,
            comment: 'Admin user ID who processed this payout',
          },
          {
            name: 'processedAt',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'completedAt',
            type: 'timestamp with time zone',
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
    await queryRunner.createIndex(
      'payouts',
      new TableIndex({
        name: 'IDX_PAYOUTS_LAWYER_ID',
        columnNames: ['lawyerId'],
      }),
    );

    await queryRunner.createIndex(
      'payouts',
      new TableIndex({
        name: 'IDX_PAYOUTS_STATUS',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'payouts',
      new TableIndex({
        name: 'IDX_PAYOUTS_PROCESSED_BY',
        columnNames: ['processedBy'],
      }),
    );

    // Add foreign key
    await queryRunner.createForeignKey(
      'payouts',
      new TableForeignKey({
        name: 'FK_PAYOUTS_LAWYER',
        columnNames: ['lawyerId'],
        referencedTableName: 'lawyers',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Add constraint: amount must be positive
    await queryRunner.query(`
      ALTER TABLE payouts
      ADD CONSTRAINT CHK_PAYOUT_AMOUNT_POSITIVE
      CHECK (amount > 0)
    `);

    console.log('✅ Created payouts table');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('payouts', 'FK_PAYOUTS_LAWYER');
    await queryRunner.dropTable('payouts');
    console.log('✅ Dropped payouts table');
  }
}
