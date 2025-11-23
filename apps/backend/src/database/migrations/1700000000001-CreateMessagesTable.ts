import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Create Messages and Message Attachments Tables
 *
 * Migration creates tables for chat messaging between clients and lawyers
 */
export class CreateMessagesTable1700000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension if not already enabled
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create messages table
    await queryRunner.createTable(
      new Table({
        name: 'messages',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'consultationId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'senderId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'senderName',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'senderAvatar',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'content',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'varchar',
            length: '50',
            isNullable: false,
            default: "'text'",
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            isNullable: false,
            default: "'sent'",
          },
          {
            name: 'createdAt',
            type: 'timestamp with time zone',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deliveredAt',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'readAt',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'deletedAt',
            type: 'timestamp with time zone',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create message_attachments table
    await queryRunner.createTable(
      new Table({
        name: 'message_attachments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'messageId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'fileName',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'fileUrl',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'fileSize',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'mimeType',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp with time zone',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes for messages table
    await queryRunner.createIndex(
      'messages',
      new TableIndex({
        name: 'IDX_MESSAGES_CONSULTATION_ID',
        columnNames: ['consultationId'],
      }),
    );

    await queryRunner.createIndex(
      'messages',
      new TableIndex({
        name: 'IDX_MESSAGES_SENDER_ID',
        columnNames: ['senderId'],
      }),
    );

    await queryRunner.createIndex(
      'messages',
      new TableIndex({
        name: 'IDX_MESSAGES_CREATED_AT',
        columnNames: ['createdAt'],
      }),
    );

    // Composite index for consultation + created_at (for pagination)
    await queryRunner.createIndex(
      'messages',
      new TableIndex({
        name: 'IDX_MESSAGES_CONSULTATION_CREATED',
        columnNames: ['consultationId', 'createdAt'],
      }),
    );

    // Index for unread messages
    await queryRunner.createIndex(
      'messages',
      new TableIndex({
        name: 'IDX_MESSAGES_STATUS',
        columnNames: ['status'],
      }),
    );

    // Create index for message_attachments
    await queryRunner.createIndex(
      'message_attachments',
      new TableIndex({
        name: 'IDX_MESSAGE_ATTACHMENTS_MESSAGE_ID',
        columnNames: ['messageId'],
      }),
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'messages',
      new TableForeignKey({
        name: 'FK_MESSAGES_CONSULTATION',
        columnNames: ['consultationId'],
        referencedTableName: 'consultations',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE', // Delete messages when consultation is deleted
      }),
    );

    await queryRunner.createForeignKey(
      'message_attachments',
      new TableForeignKey({
        name: 'FK_MESSAGE_ATTACHMENTS_MESSAGE',
        columnNames: ['messageId'],
        referencedTableName: 'messages',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE', // Delete attachments when message is deleted
      }),
    );

    // Create function to update message status to 'delivered' when read receipt is null
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_message_delivered()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.status = 'sent' AND NEW."deliveredAt" IS NULL THEN
          NEW."deliveredAt" = CURRENT_TIMESTAMP;
          NEW.status = 'delivered';
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create trigger for auto-updating deliveredAt
    await queryRunner.query(`
      CREATE TRIGGER trigger_message_delivered
      BEFORE INSERT ON messages
      FOR EACH ROW
      EXECUTE FUNCTION update_message_delivered();
    `);

    // Create function to update message status to 'read' when readAt is set
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_message_read()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW."readAt" IS NOT NULL AND OLD."readAt" IS NULL THEN
          NEW.status = 'read';
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create trigger for auto-updating read status
    await queryRunner.query(`
      CREATE TRIGGER trigger_message_read
      BEFORE UPDATE ON messages
      FOR EACH ROW
      EXECUTE FUNCTION update_message_read();
    `);

    // Enable Row Level Security (RLS) for messages
    await queryRunner.query(`ALTER TABLE messages ENABLE ROW LEVEL SECURITY;`);
    await queryRunner.query(`ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;`);

    // Create RLS policies for messages
    // Policy: Users can view messages in their consultations
    await queryRunner.query(`
      CREATE POLICY "Users can view messages in their consultations"
      ON messages
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM consultations
          WHERE consultations.id = messages."consultationId"
          AND (
            consultations."clientId" = auth.uid()
            OR consultations."lawyerId" = auth.uid()
          )
        )
      );
    `);

    // Policy: Users can insert messages in their consultations
    await queryRunner.query(`
      CREATE POLICY "Users can send messages in their consultations"
      ON messages
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM consultations
          WHERE consultations.id = messages."consultationId"
          AND (
            consultations."clientId" = auth.uid()
            OR consultations."lawyerId" = auth.uid()
          )
        )
        AND messages."senderId" = auth.uid()
      );
    `);

    // Policy: Users can update their own messages (for read receipts)
    await queryRunner.query(`
      CREATE POLICY "Users can mark messages as read"
      ON messages
      FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM consultations
          WHERE consultations.id = messages."consultationId"
          AND (
            consultations."clientId" = auth.uid()
            OR consultations."lawyerId" = auth.uid()
          )
        )
      );
    `);

    // Policy: Users can soft delete their own messages
    await queryRunner.query(`
      CREATE POLICY "Users can delete their own messages"
      ON messages
      FOR UPDATE
      USING (messages."senderId" = auth.uid());
    `);

    // RLS policies for message_attachments
    await queryRunner.query(`
      CREATE POLICY "Users can view attachments in their messages"
      ON message_attachments
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM messages
          JOIN consultations ON consultations.id = messages."consultationId"
          WHERE messages.id = message_attachments."messageId"
          AND (
            consultations."clientId" = auth.uid()
            OR consultations."lawyerId" = auth.uid()
          )
        )
      );
    `);

    await queryRunner.query(`
      CREATE POLICY "Users can insert attachments in their messages"
      ON message_attachments
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM messages
          JOIN consultations ON consultations.id = messages."consultationId"
          WHERE messages.id = message_attachments."messageId"
          AND messages."senderId" = auth.uid()
        )
      );
    `);

    // Create indexes for Realtime performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_realtime
      ON messages ("consultationId", "createdAt" DESC)
      WHERE "deletedAt" IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop RLS policies
    await queryRunner.query(`DROP POLICY IF EXISTS "Users can insert attachments in their messages" ON message_attachments;`);
    await queryRunner.query(`DROP POLICY IF EXISTS "Users can view attachments in their messages" ON message_attachments;`);
    await queryRunner.query(`DROP POLICY IF EXISTS "Users can delete their own messages" ON messages;`);
    await queryRunner.query(`DROP POLICY IF EXISTS "Users can mark messages as read" ON messages;`);
    await queryRunner.query(`DROP POLICY IF EXISTS "Users can send messages in their consultations" ON messages;`);
    await queryRunner.query(`DROP POLICY IF EXISTS "Users can view messages in their consultations" ON messages;`);

    // Disable RLS
    await queryRunner.query(`ALTER TABLE message_attachments DISABLE ROW LEVEL SECURITY;`);
    await queryRunner.query(`ALTER TABLE messages DISABLE ROW LEVEL SECURITY;`);

    // Drop triggers
    await queryRunner.query(`DROP TRIGGER IF EXISTS trigger_message_read ON messages;`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trigger_message_delivered ON messages;`);

    // Drop functions
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_message_read();`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_message_delivered();`);

    // Drop foreign keys
    await queryRunner.dropForeignKey('message_attachments', 'FK_MESSAGE_ATTACHMENTS_MESSAGE');
    await queryRunner.dropForeignKey('messages', 'FK_MESSAGES_CONSULTATION');

    // Drop indexes
    await queryRunner.dropIndex('message_attachments', 'IDX_MESSAGE_ATTACHMENTS_MESSAGE_ID');
    await queryRunner.dropIndex('messages', 'IDX_MESSAGES_STATUS');
    await queryRunner.dropIndex('messages', 'IDX_MESSAGES_CONSULTATION_CREATED');
    await queryRunner.dropIndex('messages', 'IDX_MESSAGES_CREATED_AT');
    await queryRunner.dropIndex('messages', 'IDX_MESSAGES_SENDER_ID');
    await queryRunner.dropIndex('messages', 'IDX_MESSAGES_CONSULTATION_ID');

    // Drop tables
    await queryRunner.dropTable('message_attachments');
    await queryRunner.dropTable('messages');
  }
}
