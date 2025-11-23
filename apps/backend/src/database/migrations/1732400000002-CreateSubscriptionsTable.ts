import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

/**
 * Create Subscriptions Table Migration
 */
export class CreateSubscriptionsTable1732400000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'subscriptions',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'userId', type: 'uuid', isNullable: false },
          { name: 'tier', type: 'varchar', length: '50', isNullable: false, comment: 'basic, premium, enterprise' },
          { name: 'status', type: 'varchar', length: '50', default: "'active'", comment: 'active, cancelled, expired, suspended' },
          { name: 'monthlyPrice', type: 'decimal', precision: 10, scale: 2, isNullable: false },
          { name: 'currency', type: 'varchar', length: '3', default: "'RUB'" },
          { name: 'startDate', type: 'timestamp with time zone', isNullable: false },
          { name: 'endDate', type: 'timestamp with time zone', isNullable: true },
          { name: 'nextBillingDate', type: 'timestamp with time zone', isNullable: true },
          { name: 'yooKassaSubscriptionId', type: 'varchar', length: '255', isNullable: true },
          { name: 'autoRenew', type: 'boolean', default: true },
          { name: 'features', type: 'jsonb', isNullable: true },
          { name: 'cancelledAt', type: 'timestamp with time zone', isNullable: true },
          { name: 'cancellationReason', type: 'text', isNullable: true },
          { name: 'metadata', type: 'jsonb', isNullable: true },
          { name: 'createdAt', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('subscriptions', new TableIndex({ name: 'IDX_SUBSCRIPTIONS_USER_ID', columnNames: ['userId'] }));
    await queryRunner.createIndex('subscriptions', new TableIndex({ name: 'IDX_SUBSCRIPTIONS_TIER', columnNames: ['tier'] }));
    await queryRunner.createIndex('subscriptions', new TableIndex({ name: 'IDX_SUBSCRIPTIONS_STATUS', columnNames: ['status'] }));
    await queryRunner.createIndex('subscriptions', new TableIndex({ name: 'IDX_SUBSCRIPTIONS_START_DATE', columnNames: ['startDate'] }));
    await queryRunner.createIndex('subscriptions', new TableIndex({ name: 'IDX_SUBSCRIPTIONS_END_DATE', columnNames: ['endDate'] }));
    await queryRunner.createIndex('subscriptions', new TableIndex({ name: 'IDX_SUBSCRIPTIONS_NEXT_BILLING', columnNames: ['nextBillingDate'] }));

    console.log('✅ Created subscriptions table');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('subscriptions');
    console.log('✅ Dropped subscriptions table');
  }
}
