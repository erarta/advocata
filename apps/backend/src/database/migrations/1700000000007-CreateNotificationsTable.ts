import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

/**
 * Create Notifications Table Migration
 *
 * Creates the notifications table for storing email, SMS, and push notifications.
 * Integrates with SendGrid, Twilio, and Firebase Cloud Messaging.
 */
export class CreateNotificationsTable1700000000007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension if not already enabled
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create notifications table
    await queryRunner.createTable(
      new Table({
        name: 'notifications',
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
            isNullable: false,
            comment: 'User who receives the notification',
          },
          {
            name: 'type',
            type: 'varchar',
            length: '20',
            isNullable: false,
            comment: 'Notification type (email, sms, push)',
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            default: "'pending'",
            comment: 'Notification status (pending, sent, delivered, failed, bounced)',
          },
          {
            name: 'recipient',
            type: 'varchar',
            length: '255',
            isNullable: false,
            comment: 'Recipient address (email, phone number, or device token)',
          },
          {
            name: 'subject',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'Email subject (for email notifications)',
          },
          {
            name: 'body',
            type: 'text',
            isNullable: false,
            comment: 'Notification body/message',
          },
          {
            name: 'template_id',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'Template ID (for template-based notifications)',
          },
          {
            name: 'template_data',
            type: 'jsonb',
            isNullable: true,
            comment: 'Template data for rendering',
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
            comment: 'Additional metadata',
          },
          {
            name: 'error',
            type: 'text',
            isNullable: true,
            comment: 'Error message (if failed)',
          },
          {
            name: 'external_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'External service message ID (SendGrid, Twilio, Firebase)',
          },
          {
            name: 'sent_at',
            type: 'timestamp with time zone',
            isNullable: true,
            comment: 'Timestamp when notification was sent',
          },
          {
            name: 'delivered_at',
            type: 'timestamp with time zone',
            isNullable: true,
            comment: 'Timestamp when notification was delivered',
          },
          {
            name: 'failed_at',
            type: 'timestamp with time zone',
            isNullable: true,
            comment: 'Timestamp when notification failed',
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            comment: 'Notification creation timestamp',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            comment: 'Notification last update timestamp',
          },
        ],
      }),
      true,
    );

    // Create indexes for performance
    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'IDX_NOTIFICATIONS_USER_ID',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'IDX_NOTIFICATIONS_USER_CREATED',
        columnNames: ['user_id', 'created_at'],
      }),
    );

    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'IDX_NOTIFICATIONS_STATUS',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'IDX_NOTIFICATIONS_STATUS_CREATED',
        columnNames: ['status', 'created_at'],
      }),
    );

    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'IDX_NOTIFICATIONS_TYPE',
        columnNames: ['type'],
      }),
    );

    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'IDX_NOTIFICATIONS_TYPE_STATUS',
        columnNames: ['type', 'status'],
      }),
    );

    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'IDX_NOTIFICATIONS_EXTERNAL_ID',
        columnNames: ['external_id'],
      }),
    );

    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'IDX_NOTIFICATIONS_CREATED_AT',
        columnNames: ['created_at'],
      }),
    );

    // Add check constraint: type must be valid
    await queryRunner.query(`
      ALTER TABLE notifications
      ADD CONSTRAINT CHK_NOTIFICATION_TYPE
      CHECK (type IN ('email', 'sms', 'push'))
    `);

    // Add check constraint: status must be valid
    await queryRunner.query(`
      ALTER TABLE notifications
      ADD CONSTRAINT CHK_NOTIFICATION_STATUS
      CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced'))
    `);

    // Add check constraint: email notifications must have subject
    await queryRunner.query(`
      ALTER TABLE notifications
      ADD CONSTRAINT CHK_NOTIFICATION_EMAIL_SUBJECT
      CHECK (type != 'email' OR subject IS NOT NULL)
    `);

    // Create trigger to update updated_at timestamp
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_notifications_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER trigger_update_notifications_updated_at
      BEFORE UPDATE ON notifications
      FOR EACH ROW
      EXECUTE FUNCTION update_notifications_updated_at();
    `);

    console.log('✅ Created notifications table with 8 indexes and constraints');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop trigger
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS trigger_update_notifications_updated_at ON notifications;
      DROP FUNCTION IF EXISTS update_notifications_updated_at();
    `);

    // Drop table (indexes and constraints will be dropped automatically)
    await queryRunner.dropTable('notifications');

    console.log('✅ Dropped notifications table');
  }
}
