import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

/**
 * Create Audit Logs Table Migration
 *
 * CRITICAL: This table tracks all admin actions for compliance and security
 */
export class CreateAuditLogsTable1732400000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'audit_logs',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'userId', type: 'uuid', isNullable: false, comment: 'Admin user who performed the action' },
          {
            name: 'action',
            type: 'varchar',
            length: '50',
            isNullable: false,
            comment: 'create, read, update, delete, login, logout, verify, approve, reject, suspend, ban, activate, payment, refund, payout, other',
          },
          {
            name: 'entityType',
            type: 'varchar',
            length: '100',
            isNullable: false,
            comment: 'user, lawyer, consultation, payment, payout, refund, subscription, legal_page, faq, etc.',
          },
          { name: 'entityId', type: 'varchar', length: '255', isNullable: true },
          { name: 'oldValue', type: 'jsonb', isNullable: true, comment: 'Previous state before change' },
          { name: 'newValue', type: 'jsonb', isNullable: true, comment: 'New state after change' },
          { name: 'ipAddress', type: 'varchar', length: '45', isNullable: true },
          { name: 'userAgent', type: 'text', isNullable: true },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'metadata', type: 'jsonb', isNullable: true },
          { name: 'createdAt', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    // Create indexes for fast querying
    await queryRunner.createIndex('audit_logs', new TableIndex({ name: 'IDX_AUDIT_LOGS_USER_ID', columnNames: ['userId'] }));
    await queryRunner.createIndex('audit_logs', new TableIndex({ name: 'IDX_AUDIT_LOGS_ACTION', columnNames: ['action'] }));
    await queryRunner.createIndex('audit_logs', new TableIndex({ name: 'IDX_AUDIT_LOGS_ENTITY_TYPE', columnNames: ['entityType'] }));
    await queryRunner.createIndex('audit_logs', new TableIndex({ name: 'IDX_AUDIT_LOGS_ENTITY_ID', columnNames: ['entityId'] }));
    await queryRunner.createIndex('audit_logs', new TableIndex({ name: 'IDX_AUDIT_LOGS_IP_ADDRESS', columnNames: ['ipAddress'] }));
    await queryRunner.createIndex('audit_logs', new TableIndex({ name: 'IDX_AUDIT_LOGS_CREATED_AT', columnNames: ['createdAt'] }));
    await queryRunner.createIndex('audit_logs', new TableIndex({ name: 'IDX_AUDIT_LOGS_USER_ACTION', columnNames: ['userId', 'action'] }));
    await queryRunner.createIndex('audit_logs', new TableIndex({ name: 'IDX_AUDIT_LOGS_ENTITY', columnNames: ['entityType', 'entityId'] }));

    console.log('✅ Created audit_logs table with 8 indexes');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('audit_logs');
    console.log('✅ Dropped audit_logs table');
  }
}
