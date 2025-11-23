import {
  MigrationInterface,
  QueryRunner,
  Table,
  Index,
  TableForeignKey,
} from 'typeorm';

/**
 * Create Profile Enhancement Tables
 *
 * Manages user addresses, emergency contacts, referral program, and app settings.
 * These tables support the mobile app profile features.
 */
export class CreateProfileEnhancements1732100000005
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ============================================
    // TABLE: user_addresses
    // ============================================
    await queryRunner.createTable(
      new Table({
        name: 'user_addresses',
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
            comment: 'User who owns this address',
          },
          {
            name: 'label',
            type: 'varchar',
            length: '50',
            comment: 'Address label (e.g., "Дом", "Работа")',
          },
          {
            name: 'address',
            type: 'text',
            comment: 'Full address text',
          },
          {
            name: 'latitude',
            type: 'decimal',
            precision: 10,
            scale: 8,
            comment: 'Latitude coordinate',
          },
          {
            name: 'longitude',
            type: 'decimal',
            precision: 11,
            scale: 8,
            comment: 'Longitude coordinate',
          },
          {
            name: 'is_default',
            type: 'boolean',
            default: false,
            comment: 'Whether this is the default address',
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

    // Foreign key for user_addresses
    await queryRunner.createForeignKey(
      'user_addresses',
      new TableForeignKey({
        name: 'FK_USER_ADDRESSES_USER',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Indexes for user_addresses
    await queryRunner.createIndex(
      'user_addresses',
      new Index({
        name: 'IDX_USER_ADDRESSES_USER_ID',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'user_addresses',
      new Index({
        name: 'IDX_USER_ADDRESSES_IS_DEFAULT',
        columnNames: ['user_id', 'is_default'],
        isUnique: false,
        where: 'is_default = TRUE',
      }),
    );

    // Trigger to ensure only one default address per user
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION ensure_one_default_address()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.is_default = TRUE THEN
          UPDATE user_addresses
          SET is_default = FALSE
          WHERE user_id = NEW.user_id AND id != NEW.id;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      CREATE TRIGGER trigger_ensure_one_default_address
        BEFORE INSERT OR UPDATE ON user_addresses
        FOR EACH ROW
        EXECUTE FUNCTION ensure_one_default_address();
    `);

    // ============================================
    // TABLE: emergency_contacts
    // ============================================
    await queryRunner.createTable(
      new Table({
        name: 'emergency_contacts',
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
            comment: 'User who owns this contact',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            comment: 'Contact name',
          },
          {
            name: 'phone_number',
            type: 'varchar',
            length: '20',
            comment: 'Contact phone number',
          },
          {
            name: 'relationship',
            type: 'varchar',
            length: '50',
            comment: 'Relationship to user (e.g., "Супруг(а)", "Родитель", "Друг")',
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

    // Foreign key for emergency_contacts
    await queryRunner.createForeignKey(
      'emergency_contacts',
      new TableForeignKey({
        name: 'FK_EMERGENCY_CONTACTS_USER',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Index for emergency_contacts
    await queryRunner.createIndex(
      'emergency_contacts',
      new Index({
        name: 'IDX_EMERGENCY_CONTACTS_USER_ID',
        columnNames: ['user_id'],
      }),
    );

    // ============================================
    // TABLE: referral_codes
    // ============================================
    await queryRunner.createTable(
      new Table({
        name: 'referral_codes',
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
            comment: 'User who owns this referral code (one code per user)',
          },
          {
            name: 'code',
            type: 'varchar',
            length: '20',
            isUnique: true,
            comment: 'Unique referral code',
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

    // Foreign key for referral_codes
    await queryRunner.createForeignKey(
      'referral_codes',
      new TableForeignKey({
        name: 'FK_REFERRAL_CODES_USER',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Indexes for referral_codes
    await queryRunner.createIndex(
      'referral_codes',
      new Index({
        name: 'IDX_REFERRAL_CODES_CODE',
        columnNames: ['code'],
      }),
    );

    await queryRunner.createIndex(
      'referral_codes',
      new Index({
        name: 'IDX_REFERRAL_CODES_USER_ID',
        columnNames: ['user_id'],
      }),
    );

    // ============================================
    // TABLE: referral_redemptions
    // ============================================
    await queryRunner.createTable(
      new Table({
        name: 'referral_redemptions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'referrer_id',
            type: 'uuid',
            comment: 'User who referred (owner of the code)',
          },
          {
            name: 'referee_id',
            type: 'uuid',
            isUnique: true,
            comment: 'User who was referred (can only redeem once)',
          },
          {
            name: 'code',
            type: 'varchar',
            length: '20',
            comment: 'Referral code that was used',
          },
          {
            name: 'bonus_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 500.00,
            comment: 'Bonus amount awarded (in rubles)',
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

    // Foreign keys for referral_redemptions
    await queryRunner.createForeignKey(
      'referral_redemptions',
      new TableForeignKey({
        name: 'FK_REFERRAL_REDEMPTIONS_REFERRER',
        columnNames: ['referrer_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'referral_redemptions',
      new TableForeignKey({
        name: 'FK_REFERRAL_REDEMPTIONS_REFEREE',
        columnNames: ['referee_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Indexes for referral_redemptions
    await queryRunner.createIndex(
      'referral_redemptions',
      new Index({
        name: 'IDX_REFERRAL_REDEMPTIONS_REFERRER_ID',
        columnNames: ['referrer_id'],
      }),
    );

    await queryRunner.createIndex(
      'referral_redemptions',
      new Index({
        name: 'IDX_REFERRAL_REDEMPTIONS_REFEREE_ID',
        columnNames: ['referee_id'],
      }),
    );

    // ============================================
    // TABLE: user_settings
    // ============================================
    await queryRunner.createTable(
      new Table({
        name: 'user_settings',
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
            comment: 'User who owns these settings (one settings per user)',
          },
          {
            name: 'theme_mode',
            type: 'varchar',
            length: '20',
            default: "'system'",
            comment: 'Theme mode: "light", "dark", or "system"',
          },
          {
            name: 'language',
            type: 'varchar',
            length: '10',
            default: "'ru'",
            comment: 'Preferred language code',
          },
          {
            name: 'notifications',
            type: 'jsonb',
            default:
              '\'{"pushEnabled": true, "smsEnabled": true, "emailEnabled": true, "consultationReminders": true, "paymentNotifications": true, "marketingNotifications": false}\'',
            comment: 'Notification preferences',
          },
          {
            name: 'biometric_enabled',
            type: 'boolean',
            default: false,
            comment: 'Whether biometric authentication is enabled',
          },
          {
            name: 'analytics_enabled',
            type: 'boolean',
            default: true,
            comment: 'Whether analytics tracking is enabled',
          },
          {
            name: 'crash_reporting_enabled',
            type: 'boolean',
            default: true,
            comment: 'Whether crash reporting is enabled',
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

    // Foreign key for user_settings
    await queryRunner.createForeignKey(
      'user_settings',
      new TableForeignKey({
        name: 'FK_USER_SETTINGS_USER',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Index for user_settings
    await queryRunner.createIndex(
      'user_settings',
      new Index({
        name: 'IDX_USER_SETTINGS_USER_ID',
        columnNames: ['user_id'],
      }),
    );

    // ============================================
    // UPDATED_AT TRIGGERS
    // ============================================

    // Function to update updated_at timestamp
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Triggers for updated_at
    await queryRunner.query(`
      CREATE TRIGGER trigger_user_addresses_updated_at
        BEFORE UPDATE ON user_addresses
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    await queryRunner.query(`
      CREATE TRIGGER trigger_emergency_contacts_updated_at
        BEFORE UPDATE ON emergency_contacts
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    await queryRunner.query(`
      CREATE TRIGGER trigger_user_settings_updated_at
        BEFORE UPDATE ON user_settings
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    // ============================================
    // DEFAULT DATA / SEED (Optional)
    // ============================================

    // Create default settings for existing users
    await queryRunner.query(`
      INSERT INTO user_settings (user_id, theme_mode, language)
      SELECT id, 'system', 'ru'
      FROM users
      WHERE id NOT IN (SELECT user_id FROM user_settings)
      ON CONFLICT (user_id) DO NOTHING;
    `);

    // Comments
    await queryRunner.query(`
      COMMENT ON TABLE user_addresses IS 'Saved addresses for users with geolocation';
    `);

    await queryRunner.query(`
      COMMENT ON TABLE emergency_contacts IS 'Emergency contacts for users';
    `);

    await queryRunner.query(`
      COMMENT ON TABLE referral_codes IS 'User referral codes for referral program';
    `);

    await queryRunner.query(`
      COMMENT ON TABLE referral_redemptions IS 'Referral code redemptions and bonuses';
    `);

    await queryRunner.query(`
      COMMENT ON TABLE user_settings IS 'User app settings and preferences';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers
    await queryRunner.query(
      'DROP TRIGGER IF EXISTS trigger_user_settings_updated_at ON user_settings',
    );
    await queryRunner.query(
      'DROP TRIGGER IF EXISTS trigger_emergency_contacts_updated_at ON emergency_contacts',
    );
    await queryRunner.query(
      'DROP TRIGGER IF EXISTS trigger_user_addresses_updated_at ON user_addresses',
    );
    await queryRunner.query(
      'DROP TRIGGER IF EXISTS trigger_ensure_one_default_address ON user_addresses',
    );

    // Drop functions
    await queryRunner.query(
      'DROP FUNCTION IF EXISTS update_updated_at_column()',
    );
    await queryRunner.query(
      'DROP FUNCTION IF EXISTS ensure_one_default_address()',
    );

    // Drop foreign keys
    await queryRunner.dropForeignKey('user_settings', 'FK_USER_SETTINGS_USER');
    await queryRunner.dropForeignKey(
      'referral_redemptions',
      'FK_REFERRAL_REDEMPTIONS_REFEREE',
    );
    await queryRunner.dropForeignKey(
      'referral_redemptions',
      'FK_REFERRAL_REDEMPTIONS_REFERRER',
    );
    await queryRunner.dropForeignKey('referral_codes', 'FK_REFERRAL_CODES_USER');
    await queryRunner.dropForeignKey(
      'emergency_contacts',
      'FK_EMERGENCY_CONTACTS_USER',
    );
    await queryRunner.dropForeignKey('user_addresses', 'FK_USER_ADDRESSES_USER');

    // Drop indexes
    await queryRunner.dropIndex('user_settings', 'IDX_USER_SETTINGS_USER_ID');
    await queryRunner.dropIndex(
      'referral_redemptions',
      'IDX_REFERRAL_REDEMPTIONS_REFEREE_ID',
    );
    await queryRunner.dropIndex(
      'referral_redemptions',
      'IDX_REFERRAL_REDEMPTIONS_REFERRER_ID',
    );
    await queryRunner.dropIndex('referral_codes', 'IDX_REFERRAL_CODES_USER_ID');
    await queryRunner.dropIndex('referral_codes', 'IDX_REFERRAL_CODES_CODE');
    await queryRunner.dropIndex(
      'emergency_contacts',
      'IDX_EMERGENCY_CONTACTS_USER_ID',
    );
    await queryRunner.dropIndex(
      'user_addresses',
      'IDX_USER_ADDRESSES_IS_DEFAULT',
    );
    await queryRunner.dropIndex('user_addresses', 'IDX_USER_ADDRESSES_USER_ID');

    // Drop tables
    await queryRunner.dropTable('user_settings');
    await queryRunner.dropTable('referral_redemptions');
    await queryRunner.dropTable('referral_codes');
    await queryRunner.dropTable('emergency_contacts');
    await queryRunner.dropTable('user_addresses');
  }
}
