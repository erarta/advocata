import {
  MigrationInterface,
  QueryRunner,
  Table,
  Index,
  TableForeignKey,
} from 'typeorm';

/**
 * Create Subscriptions and Subscription Plans Tables
 *
 * Manages subscription plans and user subscriptions for the platform.
 * Supports tiered pricing, trial periods, and recurring billing.
 */
export class CreateSubscriptionsAndPlans1732100000001
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ============================================
    // TABLE: subscription_plans
    // ============================================
    await queryRunner.createTable(
      new Table({
        name: 'subscription_plans',
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
            comment: 'Plan name (e.g., "Базовый", "Премиум", "Бизнес")',
          },
          {
            name: 'slug',
            type: 'varchar',
            length: '50',
            isUnique: true,
            comment: 'URL-friendly identifier (e.g., "basic", "premium")',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
            comment: 'Plan description in Russian',
          },
          {
            name: 'price',
            type: 'int',
            comment: 'Monthly price in kopecks (1 RUB = 100 kopecks)',
          },
          {
            name: 'billing_period',
            type: 'enum',
            enum: ['monthly', 'quarterly', 'yearly'],
            default: "'monthly'",
            comment: 'Billing frequency',
          },
          {
            name: 'trial_days',
            type: 'int',
            default: 0,
            comment: 'Number of free trial days (0 = no trial)',
          },
          {
            name: 'features',
            type: 'jsonb',
            default: "'[]'",
            comment:
              'Array of features (e.g., ["Unlimited consultations", "24/7 support"])',
          },
          {
            name: 'max_consultations_per_month',
            type: 'int',
            isNullable: true,
            comment: 'Maximum consultations per month (null = unlimited)',
          },
          {
            name: 'discount_percentage',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
            comment: 'Discount on consultation prices (0-100%)',
          },
          {
            name: 'priority_support',
            type: 'boolean',
            default: false,
            comment: 'Whether user gets priority customer support',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            comment: 'Whether plan is available for new subscriptions',
          },
          {
            name: 'sort_order',
            type: 'int',
            default: 0,
            comment: 'Display order (lower = first)',
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

    // Indexes for subscription_plans
    await queryRunner.createIndex(
      'subscription_plans',
      new Index({
        name: 'IDX_SUBSCRIPTION_PLANS_SLUG',
        columnNames: ['slug'],
      }),
    );

    await queryRunner.createIndex(
      'subscription_plans',
      new Index({
        name: 'IDX_SUBSCRIPTION_PLANS_IS_ACTIVE',
        columnNames: ['is_active'],
      }),
    );

    await queryRunner.createIndex(
      'subscription_plans',
      new Index({
        name: 'IDX_SUBSCRIPTION_PLANS_SORT_ORDER',
        columnNames: ['sort_order'],
      }),
    );

    // ============================================
    // TABLE: subscriptions
    // ============================================
    await queryRunner.createTable(
      new Table({
        name: 'subscriptions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            comment: 'User who owns this subscription',
          },
          {
            name: 'plan_id',
            type: 'uuid',
            comment: 'Subscription plan',
          },
          {
            name: 'status',
            type: 'enum',
            enum: [
              'active',
              'trialing',
              'past_due',
              'canceled',
              'expired',
              'paused',
            ],
            default: "'active'",
            comment: 'Subscription status',
          },
          {
            name: 'current_period_start',
            type: 'timestamp',
            comment: 'Start of current billing period',
          },
          {
            name: 'current_period_end',
            type: 'timestamp',
            comment: 'End of current billing period',
          },
          {
            name: 'trial_start',
            type: 'timestamp',
            isNullable: true,
            comment: 'Trial period start date',
          },
          {
            name: 'trial_end',
            type: 'timestamp',
            isNullable: true,
            comment: 'Trial period end date',
          },
          {
            name: 'canceled_at',
            type: 'timestamp',
            isNullable: true,
            comment: 'When subscription was canceled',
          },
          {
            name: 'cancel_at_period_end',
            type: 'boolean',
            default: false,
            comment: 'Whether to cancel at end of current period',
          },
          {
            name: 'payment_method_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'ЮКасса payment method ID',
          },
          {
            name: 'yukassa_subscription_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'ЮКасса recurring payment ID',
          },
          {
            name: 'consultations_used',
            type: 'int',
            default: 0,
            comment: 'Consultations used in current period',
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

    // Foreign keys for subscriptions
    await queryRunner.createForeignKey(
      'subscriptions',
      new TableForeignKey({
        name: 'FK_SUBSCRIPTIONS_USER',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'subscriptions',
      new TableForeignKey({
        name: 'FK_SUBSCRIPTIONS_PLAN',
        columnNames: ['plan_id'],
        referencedTableName: 'subscription_plans',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    );

    // Indexes for subscriptions
    await queryRunner.createIndex(
      'subscriptions',
      new Index({
        name: 'IDX_SUBSCRIPTIONS_USER_ID',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'subscriptions',
      new Index({
        name: 'IDX_SUBSCRIPTIONS_PLAN_ID',
        columnNames: ['plan_id'],
      }),
    );

    await queryRunner.createIndex(
      'subscriptions',
      new Index({
        name: 'IDX_SUBSCRIPTIONS_STATUS',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'subscriptions',
      new Index({
        name: 'IDX_SUBSCRIPTIONS_PERIOD_END',
        columnNames: ['current_period_end'],
      }),
    );

    await queryRunner.createIndex(
      'subscriptions',
      new Index({
        name: 'IDX_SUBSCRIPTIONS_USER_STATUS',
        columnNames: ['user_id', 'status'],
      }),
    );

    // Check constraints
    await queryRunner.query(`
      ALTER TABLE subscription_plans
      ADD CONSTRAINT CHK_SUBSCRIPTION_PLANS_PRICE_POSITIVE
      CHECK (price > 0)
    `);

    await queryRunner.query(`
      ALTER TABLE subscription_plans
      ADD CONSTRAINT CHK_SUBSCRIPTION_PLANS_TRIAL_DAYS
      CHECK (trial_days >= 0 AND trial_days <= 365)
    `);

    await queryRunner.query(`
      ALTER TABLE subscription_plans
      ADD CONSTRAINT CHK_SUBSCRIPTION_PLANS_DISCOUNT
      CHECK (discount_percentage >= 0 AND discount_percentage <= 100)
    `);

    await queryRunner.query(`
      ALTER TABLE subscriptions
      ADD CONSTRAINT CHK_SUBSCRIPTIONS_CONSULTATIONS_USED
      CHECK (consultations_used >= 0)
    `);

    await queryRunner.query(`
      ALTER TABLE subscriptions
      ADD CONSTRAINT CHK_SUBSCRIPTIONS_PERIOD_DATES
      CHECK (current_period_end > current_period_start)
    `);

    // Comments
    await queryRunner.query(`
      COMMENT ON TABLE subscription_plans IS 'Subscription plan definitions with pricing and features';
    `);

    await queryRunner.query(`
      COMMENT ON TABLE subscriptions IS 'User subscriptions with billing and usage tracking';
    `);

    // Insert default subscription plans
    await queryRunner.query(`
      INSERT INTO subscription_plans (id, name, slug, description, price, billing_period, trial_days, features, max_consultations_per_month, discount_percentage, priority_support, is_active, sort_order)
      VALUES
        (
          uuid_generate_v4(),
          'Базовый',
          'basic',
          'Доступ к базовым функциям платформы',
          99900,
          'monthly',
          7,
          '["До 5 консультаций в месяц", "Чат с юристами", "Базовая поддержка"]'::jsonb,
          5,
          0,
          false,
          true,
          1
        ),
        (
          uuid_generate_v4(),
          'Премиум',
          'premium',
          'Расширенный доступ с приоритетной поддержкой',
          299900,
          'monthly',
          14,
          '["До 20 консультаций в месяц", "Видеозвонки с юристами", "Приоритетная поддержка", "Скидка 10% на услуги"]'::jsonb,
          20,
          10,
          true,
          true,
          2
        ),
        (
          uuid_generate_v4(),
          'Бизнес',
          'business',
          'Неограниченный доступ для бизнеса',
          599900,
          'monthly',
          14,
          '["Неограниченное количество консультаций", "Видеозвонки с юристами", "Премиум поддержка 24/7", "Скидка 20% на услуги", "Персональный менеджер"]'::jsonb,
          null,
          20,
          true,
          true,
          3
        );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.dropForeignKey('subscriptions', 'FK_SUBSCRIPTIONS_PLAN');
    await queryRunner.dropForeignKey('subscriptions', 'FK_SUBSCRIPTIONS_USER');

    // Drop indexes
    await queryRunner.dropIndex(
      'subscriptions',
      'IDX_SUBSCRIPTIONS_USER_STATUS',
    );
    await queryRunner.dropIndex(
      'subscriptions',
      'IDX_SUBSCRIPTIONS_PERIOD_END',
    );
    await queryRunner.dropIndex('subscriptions', 'IDX_SUBSCRIPTIONS_STATUS');
    await queryRunner.dropIndex('subscriptions', 'IDX_SUBSCRIPTIONS_PLAN_ID');
    await queryRunner.dropIndex('subscriptions', 'IDX_SUBSCRIPTIONS_USER_ID');

    await queryRunner.dropIndex(
      'subscription_plans',
      'IDX_SUBSCRIPTION_PLANS_SORT_ORDER',
    );
    await queryRunner.dropIndex(
      'subscription_plans',
      'IDX_SUBSCRIPTION_PLANS_IS_ACTIVE',
    );
    await queryRunner.dropIndex(
      'subscription_plans',
      'IDX_SUBSCRIPTION_PLANS_SLUG',
    );

    // Drop tables
    await queryRunner.dropTable('subscriptions');
    await queryRunner.dropTable('subscription_plans');
  }
}
