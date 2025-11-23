import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

/**
 * Create Platform Config and Feature Flags Tables Migration
 */
export class CreatePlatformConfigAndFeatureFlagsTable1732400000006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create platform_configs table
    await queryRunner.createTable(
      new Table({
        name: 'platform_configs',
        columns: [
          { name: 'key', type: 'varchar', length: '100', isPrimary: true },
          { name: 'value', type: 'text', isNullable: false },
          { name: 'valueType', type: 'varchar', length: '50', default: "'string'" },
          { name: 'description', type: 'varchar', length: '255', isNullable: true },
          { name: 'category', type: 'varchar', length: '100', isNullable: true },
          { name: 'isSecret', type: 'boolean', default: false },
          { name: 'isEditable', type: 'boolean', default: true },
          { name: 'lastModifiedBy', type: 'uuid', isNullable: true },
          { name: 'createdAt', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('platform_configs', new TableIndex({ name: 'IDX_PLATFORM_CONFIGS_CATEGORY', columnNames: ['category'] }));

    // Create feature_flags table
    await queryRunner.createTable(
      new Table({
        name: 'feature_flags',
        columns: [
          { name: 'key', type: 'varchar', length: '100', isPrimary: true },
          { name: 'name', type: 'varchar', length: '255', isNullable: false },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'isEnabled', type: 'boolean', default: false },
          { name: 'environment', type: 'varchar', length: '50', default: "'all'" },
          { name: 'enabledForUsers', type: 'text', array: true, isNullable: true },
          { name: 'rolloutPercentage', type: 'decimal', precision: 5, scale: 2, isNullable: true },
          { name: 'metadata', type: 'jsonb', isNullable: true },
          { name: 'lastModifiedBy', type: 'uuid', isNullable: true },
          { name: 'createdAt', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('feature_flags', new TableIndex({ name: 'IDX_FEATURE_FLAGS_IS_ENABLED', columnNames: ['isEnabled'] }));

    console.log('✅ Created platform_configs and feature_flags tables');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('feature_flags');
    await queryRunner.dropTable('platform_configs');
    console.log('✅ Dropped platform_configs and feature_flags tables');
  }
}
