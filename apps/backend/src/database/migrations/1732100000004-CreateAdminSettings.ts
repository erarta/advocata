import {
  MigrationInterface,
  QueryRunner,
  Table,
  Index,
  TableForeignKey,
} from 'typeorm';

/**
 * Create Admin Settings and Security Tables
 *
 * Manages feature flags, admin roles/permissions, audit logging,
 * rate limiting, and platform-wide settings.
 */
export class CreateAdminSettings1732100000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ============================================
    // TABLE: feature_flags
    // ============================================
    await queryRunner.createTable(
      new Table({
        name: 'feature_flags',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'key',
            type: 'varchar',
            length: '100',
            isUnique: true,
            comment:
              'Feature flag key (e.g., "enable_video_calls", "maintenance_mode")',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            comment: 'Human-readable feature name',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
            comment: 'Feature description',
          },
          {
            name: 'is_enabled',
            type: 'boolean',
            default: false,
            comment: 'Whether feature is currently enabled',
          },
          {
            name: 'rollout_percentage',
            type: 'int',
            default: 0,
            comment: 'Gradual rollout percentage (0-100)',
          },
          {
            name: 'environment',
            type: 'enum',
            enum: ['development', 'staging', 'production', 'all'],
            default: "'all'",
            comment: 'Which environment this flag applies to',
          },
          {
            name: 'metadata',
            type: 'jsonb',
            default: "'{}'",
            comment: 'Additional configuration',
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: true,
            comment: 'Admin user who created this flag',
          },
          {
            name: 'updated_by',
            type: 'uuid',
            isNullable: true,
            comment: 'Admin user who last updated this flag',
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

    // Indexes for feature_flags
    await queryRunner.createIndex(
      'feature_flags',
      new Index({
        name: 'IDX_FEATURE_FLAGS_KEY',
        columnNames: ['key'],
      }),
    );

    await queryRunner.createIndex(
      'feature_flags',
      new Index({
        name: 'IDX_FEATURE_FLAGS_IS_ENABLED',
        columnNames: ['is_enabled'],
      }),
    );

    await queryRunner.createIndex(
      'feature_flags',
      new Index({
        name: 'IDX_FEATURE_FLAGS_ENVIRONMENT',
        columnNames: ['environment'],
      }),
    );

    // ============================================
    // TABLE: admin_roles
    // ============================================
    await queryRunner.createTable(
      new Table({
        name: 'admin_roles',
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
            isUnique: true,
            comment: 'Role name (e.g., "super_admin", "moderator", "support")',
          },
          {
            name: 'display_name',
            type: 'varchar',
            length: '255',
            comment: 'Human-readable role name in Russian',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
            comment: 'Role description',
          },
          {
            name: 'permissions',
            type: 'jsonb',
            default: "'[]'",
            comment:
              'Array of permissions (e.g., ["users.read", "users.write", "lawyers.verify"])',
          },
          {
            name: 'is_system',
            type: 'boolean',
            default: false,
            comment: 'Whether this is a system role (cannot be deleted)',
          },
          {
            name: 'priority',
            type: 'int',
            default: 0,
            comment: 'Role priority (higher = more permissions)',
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

    // Indexes for admin_roles
    await queryRunner.createIndex(
      'admin_roles',
      new Index({
        name: 'IDX_ADMIN_ROLES_NAME',
        columnNames: ['name'],
      }),
    );

    await queryRunner.createIndex(
      'admin_roles',
      new Index({
        name: 'IDX_ADMIN_ROLES_PRIORITY',
        columnNames: ['priority'],
      }),
    );

    // ============================================
    // TABLE: admin_users
    // ============================================
    await queryRunner.createTable(
      new Table({
        name: 'admin_users',
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
            isUnique: true,
            comment: 'Reference to users table',
          },
          {
            name: 'role_id',
            type: 'uuid',
            comment: 'Admin role',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            comment: 'Whether admin account is active',
          },
          {
            name: 'last_login_at',
            type: 'timestamp',
            isNullable: true,
            comment: 'Last admin panel login',
          },
          {
            name: 'last_login_ip',
            type: 'varchar',
            length: '45',
            isNullable: true,
            comment: 'IP address of last login',
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

    // Foreign keys for admin_users
    await queryRunner.createForeignKey(
      'admin_users',
      new TableForeignKey({
        name: 'FK_ADMIN_USERS_USER',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'admin_users',
      new TableForeignKey({
        name: 'FK_ADMIN_USERS_ROLE',
        columnNames: ['role_id'],
        referencedTableName: 'admin_roles',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    );

    // Indexes for admin_users
    await queryRunner.createIndex(
      'admin_users',
      new Index({
        name: 'IDX_ADMIN_USERS_USER_ID',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'admin_users',
      new Index({
        name: 'IDX_ADMIN_USERS_ROLE_ID',
        columnNames: ['role_id'],
      }),
    );

    await queryRunner.createIndex(
      'admin_users',
      new Index({
        name: 'IDX_ADMIN_USERS_IS_ACTIVE',
        columnNames: ['is_active'],
      }),
    );

    // ============================================
    // TABLE: audit_logs
    // ============================================
    await queryRunner.createTable(
      new Table({
        name: 'audit_logs',
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
            isNullable: true,
            comment: 'User who performed the action (null for system actions)',
          },
          {
            name: 'admin_user_id',
            type: 'uuid',
            isNullable: true,
            comment: 'Admin user who performed the action (if admin action)',
          },
          {
            name: 'action',
            type: 'varchar',
            length: '100',
            comment:
              'Action performed (e.g., "USER_CREATED", "LAWYER_VERIFIED", "PAYMENT_REFUNDED")',
          },
          {
            name: 'entity_type',
            type: 'varchar',
            length: '50',
            comment:
              'Type of entity affected (e.g., "user", "lawyer", "consultation")',
          },
          {
            name: 'entity_id',
            type: 'uuid',
            isNullable: true,
            comment: 'ID of affected entity',
          },
          {
            name: 'old_value',
            type: 'jsonb',
            isNullable: true,
            comment: 'Previous state (for update actions)',
          },
          {
            name: 'new_value',
            type: 'jsonb',
            isNullable: true,
            comment: 'New state (for create/update actions)',
          },
          {
            name: 'ip_address',
            type: 'varchar',
            length: '45',
            isNullable: true,
            comment: 'IP address of actor',
          },
          {
            name: 'user_agent',
            type: 'text',
            isNullable: true,
            comment: 'User agent string',
          },
          {
            name: 'metadata',
            type: 'jsonb',
            default: "'{}'",
            comment: 'Additional context',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Foreign keys for audit_logs
    await queryRunner.createForeignKey(
      'audit_logs',
      new TableForeignKey({
        name: 'FK_AUDIT_LOGS_USER',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    // Indexes for audit_logs
    await queryRunner.createIndex(
      'audit_logs',
      new Index({
        name: 'IDX_AUDIT_LOGS_USER_ID',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new Index({
        name: 'IDX_AUDIT_LOGS_ACTION',
        columnNames: ['action'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new Index({
        name: 'IDX_AUDIT_LOGS_ENTITY',
        columnNames: ['entity_type', 'entity_id'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new Index({
        name: 'IDX_AUDIT_LOGS_CREATED_AT',
        columnNames: ['created_at'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new Index({
        name: 'IDX_AUDIT_LOGS_ADMIN_USER_ID',
        columnNames: ['admin_user_id'],
      }),
    );

    // ============================================
    // TABLE: rate_limits
    // ============================================
    await queryRunner.createTable(
      new Table({
        name: 'rate_limits',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'key',
            type: 'varchar',
            length: '255',
            comment: 'Rate limit key (e.g., "api:consultations:user:123")',
          },
          {
            name: 'requests',
            type: 'int',
            comment: 'Number of requests made',
          },
          {
            name: 'window_start',
            type: 'timestamp',
            comment: 'Start of current time window',
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            comment: 'When this record expires',
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

    // Indexes for rate_limits
    await queryRunner.createIndex(
      'rate_limits',
      new Index({
        name: 'IDX_RATE_LIMITS_KEY',
        columnNames: ['key'],
      }),
    );

    await queryRunner.createIndex(
      'rate_limits',
      new Index({
        name: 'IDX_RATE_LIMITS_EXPIRES_AT',
        columnNames: ['expires_at'],
      }),
    );

    // ============================================
    // TABLE: platform_settings
    // ============================================
    await queryRunner.createTable(
      new Table({
        name: 'platform_settings',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'key',
            type: 'varchar',
            length: '100',
            isUnique: true,
            comment:
              'Setting key (e.g., "platform_commission_rate", "min_consultation_price")',
          },
          {
            name: 'value',
            type: 'text',
            comment: 'Setting value (can be JSON string)',
          },
          {
            name: 'data_type',
            type: 'enum',
            enum: ['string', 'number', 'boolean', 'json'],
            default: "'string'",
            comment: 'Data type for validation',
          },
          {
            name: 'category',
            type: 'varchar',
            length: '50',
            comment:
              'Setting category (e.g., "general", "payments", "notifications")',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
            comment: 'Setting description',
          },
          {
            name: 'is_public',
            type: 'boolean',
            default: false,
            comment: 'Whether this setting is accessible via public API',
          },
          {
            name: 'updated_by',
            type: 'uuid',
            isNullable: true,
            comment: 'Admin user who last updated this setting',
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

    // Indexes for platform_settings
    await queryRunner.createIndex(
      'platform_settings',
      new Index({
        name: 'IDX_PLATFORM_SETTINGS_KEY',
        columnNames: ['key'],
      }),
    );

    await queryRunner.createIndex(
      'platform_settings',
      new Index({
        name: 'IDX_PLATFORM_SETTINGS_CATEGORY',
        columnNames: ['category'],
      }),
    );

    await queryRunner.createIndex(
      'platform_settings',
      new Index({
        name: 'IDX_PLATFORM_SETTINGS_IS_PUBLIC',
        columnNames: ['is_public'],
      }),
    );

    // Check constraints
    await queryRunner.query(`
      ALTER TABLE feature_flags
      ADD CONSTRAINT CHK_FEATURE_FLAGS_ROLLOUT_PERCENTAGE
      CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100)
    `);

    await queryRunner.query(`
      ALTER TABLE rate_limits
      ADD CONSTRAINT CHK_RATE_LIMITS_REQUESTS
      CHECK (requests >= 0)
    `);

    await queryRunner.query(`
      ALTER TABLE rate_limits
      ADD CONSTRAINT CHK_RATE_LIMITS_DATES
      CHECK (expires_at > window_start)
    `);

    // Comments
    await queryRunner.query(`
      COMMENT ON TABLE feature_flags IS 'Feature flags for gradual rollout and A/B testing';
    `);

    await queryRunner.query(`
      COMMENT ON TABLE admin_roles IS 'Admin roles and their permissions';
    `);

    await queryRunner.query(`
      COMMENT ON TABLE admin_users IS 'Admin user accounts with role assignments';
    `);

    await queryRunner.query(`
      COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for all system actions';
    `);

    await queryRunner.query(`
      COMMENT ON TABLE rate_limits IS 'API rate limiting tracking';
    `);

    await queryRunner.query(`
      COMMENT ON TABLE platform_settings IS 'Platform-wide configuration settings';
    `);

    // Insert default admin roles
    await queryRunner.query(`
      INSERT INTO admin_roles (id, name, display_name, description, permissions, is_system, priority)
      VALUES
        (
          uuid_generate_v4(),
          'super_admin',
          'Суперадминистратор',
          'Полный доступ ко всем функциям платформы',
          '["*"]'::jsonb,
          true,
          100
        ),
        (
          uuid_generate_v4(),
          'admin',
          'Администратор',
          'Основные административные функции',
          '["users.read", "users.write", "lawyers.read", "lawyers.verify", "consultations.read", "consultations.write", "payments.read", "analytics.read", "content.write"]'::jsonb,
          true,
          80
        ),
        (
          uuid_generate_v4(),
          'moderator',
          'Модератор',
          'Модерация контента и пользователей',
          '["users.read", "lawyers.read", "lawyers.verify", "consultations.read", "content.read", "content.write"]'::jsonb,
          true,
          60
        ),
        (
          uuid_generate_v4(),
          'support',
          'Служба поддержки',
          'Поддержка пользователей и обработка тикетов',
          '["users.read", "lawyers.read", "consultations.read", "support.read", "support.write"]'::jsonb,
          true,
          40
        ),
        (
          uuid_generate_v4(),
          'analyst',
          'Аналитик',
          'Доступ к аналитике и отчетам',
          '["analytics.read", "users.read", "lawyers.read", "consultations.read", "payments.read"]'::jsonb,
          true,
          20
        );
    `);

    // Insert default platform settings
    await queryRunner.query(`
      INSERT INTO platform_settings (id, key, value, data_type, category, description, is_public)
      VALUES
        (
          uuid_generate_v4(),
          'platform_commission_rate',
          '15',
          'number',
          'payments',
          'Стандартная комиссия платформы (%)',
          false
        ),
        (
          uuid_generate_v4(),
          'min_consultation_price',
          '50000',
          'number',
          'payments',
          'Минимальная стоимость консультации (в копейках)',
          true
        ),
        (
          uuid_generate_v4(),
          'emergency_call_multiplier',
          '2',
          'number',
          'payments',
          'Множитель стоимости для экстренных вызовов',
          false
        ),
        (
          uuid_generate_v4(),
          'maintenance_mode',
          'false',
          'boolean',
          'general',
          'Режим обслуживания (отключает приложение для обновлений)',
          true
        ),
        (
          uuid_generate_v4(),
          'max_consultations_per_day',
          '10',
          'number',
          'general',
          'Максимальное количество консультаций на пользователя в день',
          false
        ),
        (
          uuid_generate_v4(),
          'support_email',
          'support@advocata.ru',
          'string',
          'general',
          'Email адрес службы поддержки',
          true
        ),
        (
          uuid_generate_v4(),
          'support_phone',
          '+7 (812) 123-45-67',
          'string',
          'general',
          'Телефон службы поддержки',
          true
        );
    `);

    // Insert default feature flags
    await queryRunner.query(`
      INSERT INTO feature_flags (id, key, name, description, is_enabled, environment)
      VALUES
        (
          uuid_generate_v4(),
          'enable_video_calls',
          'Видеозвонки',
          'Включить видеозвонки с юристами через Agora',
          true,
          'all'
        ),
        (
          uuid_generate_v4(),
          'enable_emergency_calls',
          'Экстренные вызовы',
          'Включить функцию экстренных вызовов юристов',
          true,
          'all'
        ),
        (
          uuid_generate_v4(),
          'enable_subscriptions',
          'Подписки',
          'Включить платные подписки для клиентов',
          true,
          'all'
        ),
        (
          uuid_generate_v4(),
          'enable_referral_program',
          'Реферальная программа',
          'Включить реферальную программу с бонусами',
          true,
          'all'
        ),
        (
          uuid_generate_v4(),
          'enable_document_ocr',
          'OCR документов',
          'Включить распознавание текста в документах',
          false,
          'all'
        ),
        (
          uuid_generate_v4(),
          'maintenance_mode',
          'Режим обслуживания',
          'Включить режим обслуживания (блокирует доступ к приложению)',
          false,
          'all'
        );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.dropForeignKey('admin_users', 'FK_ADMIN_USERS_ROLE');
    await queryRunner.dropForeignKey('admin_users', 'FK_ADMIN_USERS_USER');
    await queryRunner.dropForeignKey('audit_logs', 'FK_AUDIT_LOGS_USER');

    // Drop indexes
    await queryRunner.dropIndex(
      'platform_settings',
      'IDX_PLATFORM_SETTINGS_IS_PUBLIC',
    );
    await queryRunner.dropIndex(
      'platform_settings',
      'IDX_PLATFORM_SETTINGS_CATEGORY',
    );
    await queryRunner.dropIndex(
      'platform_settings',
      'IDX_PLATFORM_SETTINGS_KEY',
    );

    await queryRunner.dropIndex('rate_limits', 'IDX_RATE_LIMITS_EXPIRES_AT');
    await queryRunner.dropIndex('rate_limits', 'IDX_RATE_LIMITS_KEY');

    await queryRunner.dropIndex('audit_logs', 'IDX_AUDIT_LOGS_ADMIN_USER_ID');
    await queryRunner.dropIndex('audit_logs', 'IDX_AUDIT_LOGS_CREATED_AT');
    await queryRunner.dropIndex('audit_logs', 'IDX_AUDIT_LOGS_ENTITY');
    await queryRunner.dropIndex('audit_logs', 'IDX_AUDIT_LOGS_ACTION');
    await queryRunner.dropIndex('audit_logs', 'IDX_AUDIT_LOGS_USER_ID');

    await queryRunner.dropIndex('admin_users', 'IDX_ADMIN_USERS_IS_ACTIVE');
    await queryRunner.dropIndex('admin_users', 'IDX_ADMIN_USERS_ROLE_ID');
    await queryRunner.dropIndex('admin_users', 'IDX_ADMIN_USERS_USER_ID');

    await queryRunner.dropIndex('admin_roles', 'IDX_ADMIN_ROLES_PRIORITY');
    await queryRunner.dropIndex('admin_roles', 'IDX_ADMIN_ROLES_NAME');

    await queryRunner.dropIndex(
      'feature_flags',
      'IDX_FEATURE_FLAGS_ENVIRONMENT',
    );
    await queryRunner.dropIndex('feature_flags', 'IDX_FEATURE_FLAGS_IS_ENABLED');
    await queryRunner.dropIndex('feature_flags', 'IDX_FEATURE_FLAGS_KEY');

    // Drop tables
    await queryRunner.dropTable('platform_settings');
    await queryRunner.dropTable('rate_limits');
    await queryRunner.dropTable('audit_logs');
    await queryRunner.dropTable('admin_users');
    await queryRunner.dropTable('admin_roles');
    await queryRunner.dropTable('feature_flags');
  }
}
