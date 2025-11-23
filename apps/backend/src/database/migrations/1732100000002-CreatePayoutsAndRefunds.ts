import {
  MigrationInterface,
  QueryRunner,
  Table,
  Index,
  TableForeignKey,
} from 'typeorm';

/**
 * Create Payouts, Refunds, and Commission Rules Tables
 *
 * Manages financial operations for lawyer payouts, customer refunds,
 * and platform commission calculations.
 */
export class CreatePayoutsAndRefunds1732100000002
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ============================================
    // TABLE: commission_rules
    // ============================================
    await queryRunner.createTable(
      new Table({
        name: 'commission_rules',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            comment: 'Rule name (e.g., "Default Commission", "VIP Lawyers")',
          },
          {
            name: 'lawyer_tier',
            type: 'enum',
            enum: ['new', 'standard', 'gold', 'platinum', 'all'],
            default: "'all'",
            comment: 'Applies to which lawyer tier',
          },
          {
            name: 'commission_percentage',
            type: 'decimal',
            precision: 5,
            scale: 2,
            comment: 'Platform commission percentage (0-100)',
          },
          {
            name: 'min_consultations',
            type: 'int',
            default: 0,
            comment:
              'Minimum consultations required for this rate (0 = no minimum)',
          },
          {
            name: 'max_consultations',
            type: 'int',
            isNullable: true,
            comment: 'Maximum consultations for this rate (null = no maximum)',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            comment: 'Whether this rule is currently active',
          },
          {
            name: 'effective_from',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            comment: 'When this rule becomes effective',
          },
          {
            name: 'effective_until',
            type: 'timestamp',
            isNullable: true,
            comment: 'When this rule expires (null = no expiration)',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Indexes for commission_rules
    await queryRunner.createIndex(
      'commission_rules',
      new Index({
        name: 'IDX_COMMISSION_RULES_LAWYER_TIER',
        columnNames: ['lawyer_tier'],
      }),
    );

    await queryRunner.createIndex(
      'commission_rules',
      new Index({
        name: 'IDX_COMMISSION_RULES_IS_ACTIVE',
        columnNames: ['is_active'],
      }),
    );

    await queryRunner.createIndex(
      'commission_rules',
      new Index({
        name: 'IDX_COMMISSION_RULES_EFFECTIVE',
        columnNames: ['effective_from', 'effective_until'],
      }),
    );

    // ============================================
    // TABLE: payouts
    // ============================================
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
            name: 'lawyer_id',
            type: 'uuid',
            comment: 'Lawyer receiving the payout',
          },
          {
            name: 'amount',
            type: 'int',
            comment: 'Payout amount in kopecks (after commission)',
          },
          {
            name: 'gross_amount',
            type: 'int',
            comment: 'Total earnings before commission',
          },
          {
            name: 'commission_amount',
            type: 'int',
            comment: 'Platform commission amount in kopecks',
          },
          {
            name: 'commission_percentage',
            type: 'decimal',
            precision: 5,
            scale: 2,
            comment: 'Commission rate applied',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'processing', 'completed', 'failed', 'canceled'],
            default: "'pending'",
            comment: 'Payout status',
          },
          {
            name: 'period_start',
            type: 'timestamp',
            comment: 'Start of payout period',
          },
          {
            name: 'period_end',
            type: 'timestamp',
            comment: 'End of payout period',
          },
          {
            name: 'consultation_count',
            type: 'int',
            default: 0,
            comment: 'Number of consultations in this payout',
          },
          {
            name: 'payment_method',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'Payout method (e.g., "bank_card", "bank_account")',
          },
          {
            name: 'payment_details',
            type: 'jsonb',
            default: "'{}'",
            comment: 'Encrypted payment details',
          },
          {
            name: 'yukassa_payout_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'ЮКасса payout transaction ID',
          },
          {
            name: 'processed_at',
            type: 'timestamp',
            isNullable: true,
            comment: 'When payout was processed',
          },
          {
            name: 'failed_reason',
            type: 'text',
            isNullable: true,
            comment: 'Reason for failure if status is failed',
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
            comment: 'Admin notes about this payout',
          },
          {
            name: 'metadata',
            type: 'jsonb',
            default: "'{}'",
            comment: 'Additional metadata',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Foreign key for payouts
    await queryRunner.createForeignKey(
      'payouts',
      new TableForeignKey({
        name: 'FK_PAYOUTS_LAWYER',
        columnNames: ['lawyer_id'],
        referencedTableName: 'lawyers',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Indexes for payouts
    await queryRunner.createIndex(
      'payouts',
      new Index({
        name: 'IDX_PAYOUTS_LAWYER_ID',
        columnNames: ['lawyer_id'],
      }),
    );

    await queryRunner.createIndex(
      'payouts',
      new Index({
        name: 'IDX_PAYOUTS_STATUS',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'payouts',
      new Index({
        name: 'IDX_PAYOUTS_PERIOD',
        columnNames: ['period_start', 'period_end'],
      }),
    );

    await queryRunner.createIndex(
      'payouts',
      new Index({
        name: 'IDX_PAYOUTS_LAWYER_STATUS',
        columnNames: ['lawyer_id', 'status'],
      }),
    );

    await queryRunner.createIndex(
      'payouts',
      new Index({
        name: 'IDX_PAYOUTS_CREATED_AT',
        columnNames: ['created_at'],
      }),
    );

    // ============================================
    // TABLE: refunds
    // ============================================
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
            name: 'payment_id',
            type: 'uuid',
            comment: 'Original payment being refunded',
          },
          {
            name: 'consultation_id',
            type: 'uuid',
            isNullable: true,
            comment: 'Consultation related to this refund',
          },
          {
            name: 'user_id',
            type: 'uuid',
            comment: 'User receiving the refund',
          },
          {
            name: 'amount',
            type: 'int',
            comment: 'Refund amount in kopecks',
          },
          {
            name: 'original_amount',
            type: 'int',
            comment: 'Original payment amount',
          },
          {
            name: 'refund_type',
            type: 'enum',
            enum: ['full', 'partial'],
            default: "'full'",
            comment: 'Type of refund',
          },
          {
            name: 'reason',
            type: 'enum',
            enum: [
              'cancelled_by_client',
              'cancelled_by_lawyer',
              'no_show',
              'technical_issue',
              'poor_service',
              'other',
            ],
            comment: 'Reason for refund',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'processing', 'completed', 'failed', 'rejected'],
            default: "'pending'",
            comment: 'Refund status',
          },
          {
            name: 'requested_by',
            type: 'enum',
            enum: ['client', 'lawyer', 'admin', 'system'],
            comment: 'Who requested the refund',
          },
          {
            name: 'requested_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            comment: 'When refund was requested',
          },
          {
            name: 'approved_by',
            type: 'uuid',
            isNullable: true,
            comment: 'Admin user who approved the refund',
          },
          {
            name: 'approved_at',
            type: 'timestamp',
            isNullable: true,
            comment: 'When refund was approved',
          },
          {
            name: 'processed_at',
            type: 'timestamp',
            isNullable: true,
            comment: 'When refund was processed',
          },
          {
            name: 'yukassa_refund_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'ЮКасса refund transaction ID',
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
            comment: 'Additional notes or reason details',
          },
          {
            name: 'failed_reason',
            type: 'text',
            isNullable: true,
            comment: 'Reason for failure if status is failed',
          },
          {
            name: 'metadata',
            type: 'jsonb',
            default: "'{}'",
            comment: 'Additional metadata',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Foreign keys for refunds
    await queryRunner.createForeignKey(
      'refunds',
      new TableForeignKey({
        name: 'FK_REFUNDS_PAYMENT',
        columnNames: ['payment_id'],
        referencedTableName: 'payments',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'refunds',
      new TableForeignKey({
        name: 'FK_REFUNDS_CONSULTATION',
        columnNames: ['consultation_id'],
        referencedTableName: 'consultations',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'refunds',
      new TableForeignKey({
        name: 'FK_REFUNDS_USER',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Indexes for refunds
    await queryRunner.createIndex(
      'refunds',
      new Index({
        name: 'IDX_REFUNDS_PAYMENT_ID',
        columnNames: ['payment_id'],
      }),
    );

    await queryRunner.createIndex(
      'refunds',
      new Index({
        name: 'IDX_REFUNDS_CONSULTATION_ID',
        columnNames: ['consultation_id'],
      }),
    );

    await queryRunner.createIndex(
      'refunds',
      new Index({
        name: 'IDX_REFUNDS_USER_ID',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'refunds',
      new Index({
        name: 'IDX_REFUNDS_STATUS',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'refunds',
      new Index({
        name: 'IDX_REFUNDS_REASON',
        columnNames: ['reason'],
      }),
    );

    await queryRunner.createIndex(
      'refunds',
      new Index({
        name: 'IDX_REFUNDS_REQUESTED_AT',
        columnNames: ['requested_at'],
      }),
    );

    // Check constraints
    await queryRunner.query(`
      ALTER TABLE commission_rules
      ADD CONSTRAINT CHK_COMMISSION_RULES_PERCENTAGE
      CHECK (commission_percentage >= 0 AND commission_percentage <= 100)
    `);

    await queryRunner.query(`
      ALTER TABLE commission_rules
      ADD CONSTRAINT CHK_COMMISSION_RULES_CONSULTATIONS
      CHECK (
        min_consultations >= 0 AND
        (max_consultations IS NULL OR max_consultations >= min_consultations)
      )
    `);

    await queryRunner.query(`
      ALTER TABLE payouts
      ADD CONSTRAINT CHK_PAYOUTS_AMOUNTS_POSITIVE
      CHECK (
        amount > 0 AND
        gross_amount > 0 AND
        commission_amount >= 0 AND
        amount = gross_amount - commission_amount
      )
    `);

    await queryRunner.query(`
      ALTER TABLE payouts
      ADD CONSTRAINT CHK_PAYOUTS_PERIOD
      CHECK (period_end > period_start)
    `);

    await queryRunner.query(`
      ALTER TABLE refunds
      ADD CONSTRAINT CHK_REFUNDS_AMOUNTS
      CHECK (
        amount > 0 AND
        original_amount > 0 AND
        amount <= original_amount
      )
    `);

    // Comments
    await queryRunner.query(`
      COMMENT ON TABLE commission_rules IS 'Platform commission rules for calculating lawyer payouts';
    `);

    await queryRunner.query(`
      COMMENT ON TABLE payouts IS 'Lawyer payout transactions with commission calculations';
    `);

    await queryRunner.query(`
      COMMENT ON TABLE refunds IS 'Customer refund requests and processing';
    `);

    // Insert default commission rules
    await queryRunner.query(`
      INSERT INTO commission_rules (id, name, lawyer_tier, commission_percentage, min_consultations, max_consultations, is_active, effective_from)
      VALUES
        (
          uuid_generate_v4(),
          'Стандартная комиссия для новых юристов',
          'new',
          20.00,
          0,
          10,
          true,
          CURRENT_TIMESTAMP
        ),
        (
          uuid_generate_v4(),
          'Стандартная комиссия',
          'standard',
          15.00,
          11,
          50,
          true,
          CURRENT_TIMESTAMP
        ),
        (
          uuid_generate_v4(),
          'Сниженная комиссия для опытных юристов',
          'gold',
          12.00,
          51,
          200,
          true,
          CURRENT_TIMESTAMP
        ),
        (
          uuid_generate_v4(),
          'VIP комиссия для платиновых юристов',
          'platinum',
          8.00,
          201,
          null,
          true,
          CURRENT_TIMESTAMP
        );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.dropForeignKey('refunds', 'FK_REFUNDS_USER');
    await queryRunner.dropForeignKey('refunds', 'FK_REFUNDS_CONSULTATION');
    await queryRunner.dropForeignKey('refunds', 'FK_REFUNDS_PAYMENT');
    await queryRunner.dropForeignKey('payouts', 'FK_PAYOUTS_LAWYER');

    // Drop indexes
    await queryRunner.dropIndex('refunds', 'IDX_REFUNDS_REQUESTED_AT');
    await queryRunner.dropIndex('refunds', 'IDX_REFUNDS_REASON');
    await queryRunner.dropIndex('refunds', 'IDX_REFUNDS_STATUS');
    await queryRunner.dropIndex('refunds', 'IDX_REFUNDS_USER_ID');
    await queryRunner.dropIndex('refunds', 'IDX_REFUNDS_CONSULTATION_ID');
    await queryRunner.dropIndex('refunds', 'IDX_REFUNDS_PAYMENT_ID');

    await queryRunner.dropIndex('payouts', 'IDX_PAYOUTS_CREATED_AT');
    await queryRunner.dropIndex('payouts', 'IDX_PAYOUTS_LAWYER_STATUS');
    await queryRunner.dropIndex('payouts', 'IDX_PAYOUTS_PERIOD');
    await queryRunner.dropIndex('payouts', 'IDX_PAYOUTS_STATUS');
    await queryRunner.dropIndex('payouts', 'IDX_PAYOUTS_LAWYER_ID');

    await queryRunner.dropIndex(
      'commission_rules',
      'IDX_COMMISSION_RULES_EFFECTIVE',
    );
    await queryRunner.dropIndex(
      'commission_rules',
      'IDX_COMMISSION_RULES_IS_ACTIVE',
    );
    await queryRunner.dropIndex(
      'commission_rules',
      'IDX_COMMISSION_RULES_LAWYER_TIER',
    );

    // Drop tables
    await queryRunner.dropTable('refunds');
    await queryRunner.dropTable('payouts');
    await queryRunner.dropTable('commission_rules');
  }
}
