import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

/**
 * Create Support Tickets Table Migration
 */
export class CreateSupportTicketsTable1732400000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'support_tickets',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'userId', type: 'uuid', isNullable: false },
          { name: 'subject', type: 'varchar', length: '255', isNullable: false },
          { name: 'description', type: 'text', isNullable: false },
          {
            name: 'category',
            type: 'varchar',
            length: '100',
            isNullable: false,
            comment: 'technical, billing, account, consultation, lawyer_verification, complaint, feature_request, other',
          },
          {
            name: 'priority',
            type: 'varchar',
            length: '50',
            default: "'medium'",
            comment: 'low, medium, high, urgent',
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'open'",
            comment: 'open, assigned, in_progress, waiting_for_customer, resolved, closed',
          },
          { name: 'assignedTo', type: 'uuid', isNullable: true, comment: 'Admin user ID' },
          { name: 'assignedAt', type: 'timestamp with time zone', isNullable: true },
          { name: 'resolvedAt', type: 'timestamp with time zone', isNullable: true },
          { name: 'closedAt', type: 'timestamp with time zone', isNullable: true },
          {
            name: 'messages',
            type: 'jsonb',
            isNullable: true,
            comment: 'Array of ticket messages with replies',
          },
          { name: 'attachments', type: 'text', array: true, isNullable: true },
          { name: 'metadata', type: 'jsonb', isNullable: true },
          { name: 'createdAt', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('support_tickets', new TableIndex({ name: 'IDX_SUPPORT_TICKETS_USER_ID', columnNames: ['userId'] }));
    await queryRunner.createIndex('support_tickets', new TableIndex({ name: 'IDX_SUPPORT_TICKETS_CATEGORY', columnNames: ['category'] }));
    await queryRunner.createIndex('support_tickets', new TableIndex({ name: 'IDX_SUPPORT_TICKETS_PRIORITY', columnNames: ['priority'] }));
    await queryRunner.createIndex('support_tickets', new TableIndex({ name: 'IDX_SUPPORT_TICKETS_STATUS', columnNames: ['status'] }));
    await queryRunner.createIndex('support_tickets', new TableIndex({ name: 'IDX_SUPPORT_TICKETS_ASSIGNED_TO', columnNames: ['assignedTo'] }));
    await queryRunner.createIndex('support_tickets', new TableIndex({ name: 'IDX_SUPPORT_TICKETS_STATUS_PRIORITY', columnNames: ['status', 'priority'] }));

    console.log('✅ Created support_tickets table');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('support_tickets');
    console.log('✅ Dropped support_tickets table');
  }
}
