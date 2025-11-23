import {
  MigrationInterface,
  QueryRunner,
  Table,
  Index,
  TableForeignKey,
} from 'typeorm';

/**
 * Create Content Management Tables
 *
 * Manages FAQ, legal pages, support tickets, document templates, and onboarding content.
 */
export class CreateContentManagement1732100000003
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ============================================
    // TABLE: faq
    // ============================================
    await queryRunner.createTable(
      new Table({
        name: 'faq',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'category',
            type: 'varchar',
            length: '100',
            comment:
              'FAQ category (e.g., "Общие вопросы", "Оплата", "Консультации")',
          },
          {
            name: 'question',
            type: 'text',
            comment: 'Question in Russian',
          },
          {
            name: 'answer',
            type: 'text',
            comment: 'Answer in Russian (supports HTML)',
          },
          {
            name: 'sort_order',
            type: 'int',
            default: 0,
            comment: 'Display order (lower = first)',
          },
          {
            name: 'is_published',
            type: 'boolean',
            default: true,
            comment: 'Whether FAQ is visible to users',
          },
          {
            name: 'view_count',
            type: 'int',
            default: 0,
            comment: 'Number of times this FAQ was viewed',
          },
          {
            name: 'helpful_count',
            type: 'int',
            default: 0,
            comment: 'Number of "helpful" votes',
          },
          {
            name: 'not_helpful_count',
            type: 'int',
            default: 0,
            comment: 'Number of "not helpful" votes',
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: true,
            comment: 'Admin user who created this FAQ',
          },
          {
            name: 'updated_by',
            type: 'uuid',
            isNullable: true,
            comment: 'Admin user who last updated this FAQ',
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

    // Indexes for faq
    await queryRunner.createIndex(
      'faq',
      new Index({
        name: 'IDX_FAQ_CATEGORY',
        columnNames: ['category'],
      }),
    );

    await queryRunner.createIndex(
      'faq',
      new Index({
        name: 'IDX_FAQ_IS_PUBLISHED',
        columnNames: ['is_published'],
      }),
    );

    await queryRunner.createIndex(
      'faq',
      new Index({
        name: 'IDX_FAQ_SORT_ORDER',
        columnNames: ['sort_order'],
      }),
    );

    await queryRunner.createIndex(
      'faq',
      new Index({
        name: 'IDX_FAQ_CATEGORY_PUBLISHED',
        columnNames: ['category', 'is_published', 'sort_order'],
      }),
    );

    // ============================================
    // TABLE: legal_pages
    // ============================================
    await queryRunner.createTable(
      new Table({
        name: 'legal_pages',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'slug',
            type: 'varchar',
            length: '100',
            isUnique: true,
            comment:
              'URL slug (e.g., "terms-of-service", "privacy-policy", "refund-policy")',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
            comment: 'Page title in Russian',
          },
          {
            name: 'content',
            type: 'text',
            comment: 'Page content in Russian (supports HTML/Markdown)',
          },
          {
            name: 'meta_description',
            type: 'text',
            isNullable: true,
            comment: 'SEO meta description',
          },
          {
            name: 'version',
            type: 'int',
            default: 1,
            comment: 'Version number (increments on each update)',
          },
          {
            name: 'is_published',
            type: 'boolean',
            default: false,
            comment: 'Whether page is visible to users',
          },
          {
            name: 'published_at',
            type: 'timestamp',
            isNullable: true,
            comment: 'When page was last published',
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: true,
            comment: 'Admin user who created this page',
          },
          {
            name: 'updated_by',
            type: 'uuid',
            isNullable: true,
            comment: 'Admin user who last updated this page',
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

    // Indexes for legal_pages
    await queryRunner.createIndex(
      'legal_pages',
      new Index({
        name: 'IDX_LEGAL_PAGES_SLUG',
        columnNames: ['slug'],
      }),
    );

    await queryRunner.createIndex(
      'legal_pages',
      new Index({
        name: 'IDX_LEGAL_PAGES_IS_PUBLISHED',
        columnNames: ['is_published'],
      }),
    );

    // ============================================
    // TABLE: support_tickets
    // ============================================
    await queryRunner.createTable(
      new Table({
        name: 'support_tickets',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'ticket_number',
            type: 'varchar',
            length: '20',
            isUnique: true,
            comment: 'Human-readable ticket number (e.g., "TKT-001234")',
          },
          {
            name: 'user_id',
            type: 'uuid',
            comment: 'User who created the ticket',
          },
          {
            name: 'subject',
            type: 'varchar',
            length: '255',
            comment: 'Ticket subject',
          },
          {
            name: 'description',
            type: 'text',
            comment: 'Detailed description of the issue',
          },
          {
            name: 'category',
            type: 'enum',
            enum: [
              'technical',
              'billing',
              'account',
              'consultation',
              'complaint',
              'other',
            ],
            comment: 'Ticket category',
          },
          {
            name: 'priority',
            type: 'enum',
            enum: ['low', 'medium', 'high', 'urgent'],
            default: "'medium'",
            comment: 'Ticket priority',
          },
          {
            name: 'status',
            type: 'enum',
            enum: [
              'open',
              'in_progress',
              'waiting_customer',
              'waiting_internal',
              'resolved',
              'closed',
            ],
            default: "'open'",
            comment: 'Ticket status',
          },
          {
            name: 'assigned_to',
            type: 'uuid',
            isNullable: true,
            comment: 'Admin user assigned to this ticket',
          },
          {
            name: 'resolved_at',
            type: 'timestamp',
            isNullable: true,
            comment: 'When ticket was resolved',
          },
          {
            name: 'closed_at',
            type: 'timestamp',
            isNullable: true,
            comment: 'When ticket was closed',
          },
          {
            name: 'first_response_at',
            type: 'timestamp',
            isNullable: true,
            comment: 'When first admin response was sent',
          },
          {
            name: 'last_response_at',
            type: 'timestamp',
            isNullable: true,
            comment: 'When last response was sent',
          },
          {
            name: 'metadata',
            type: 'jsonb',
            default: "'{}'",
            comment: 'Additional metadata (user agent, IP, etc.)',
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

    // Foreign keys for support_tickets
    await queryRunner.createForeignKey(
      'support_tickets',
      new TableForeignKey({
        name: 'FK_SUPPORT_TICKETS_USER',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Indexes for support_tickets
    await queryRunner.createIndex(
      'support_tickets',
      new Index({
        name: 'IDX_SUPPORT_TICKETS_TICKET_NUMBER',
        columnNames: ['ticket_number'],
      }),
    );

    await queryRunner.createIndex(
      'support_tickets',
      new Index({
        name: 'IDX_SUPPORT_TICKETS_USER_ID',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'support_tickets',
      new Index({
        name: 'IDX_SUPPORT_TICKETS_STATUS',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'support_tickets',
      new Index({
        name: 'IDX_SUPPORT_TICKETS_PRIORITY',
        columnNames: ['priority'],
      }),
    );

    await queryRunner.createIndex(
      'support_tickets',
      new Index({
        name: 'IDX_SUPPORT_TICKETS_CATEGORY',
        columnNames: ['category'],
      }),
    );

    await queryRunner.createIndex(
      'support_tickets',
      new Index({
        name: 'IDX_SUPPORT_TICKETS_ASSIGNED_TO',
        columnNames: ['assigned_to'],
      }),
    );

    await queryRunner.createIndex(
      'support_tickets',
      new Index({
        name: 'IDX_SUPPORT_TICKETS_CREATED_AT',
        columnNames: ['created_at'],
      }),
    );

    // ============================================
    // TABLE: document_templates
    // ============================================
    await queryRunner.createTable(
      new Table({
        name: 'document_templates',
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
            length: '255',
            comment: 'Template name (e.g., "Договор оказания юридических услуг")',
          },
          {
            name: 'slug',
            type: 'varchar',
            length: '100',
            isUnique: true,
            comment: 'URL-friendly identifier',
          },
          {
            name: 'category',
            type: 'varchar',
            length: '100',
            comment: 'Template category (e.g., "Договоры", "Заявления", "Доверенности")',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
            comment: 'Template description',
          },
          {
            name: 'content',
            type: 'text',
            comment: 'Template content with placeholders (supports HTML)',
          },
          {
            name: 'variables',
            type: 'jsonb',
            default: "'[]'",
            comment: 'Available template variables with descriptions',
          },
          {
            name: 'file_type',
            type: 'enum',
            enum: ['pdf', 'docx', 'html'],
            default: "'pdf'",
            comment: 'Output file format',
          },
          {
            name: 'is_published',
            type: 'boolean',
            default: false,
            comment: 'Whether template is available to users',
          },
          {
            name: 'usage_count',
            type: 'int',
            default: 0,
            comment: 'Number of times this template was used',
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: true,
            comment: 'Admin user who created this template',
          },
          {
            name: 'updated_by',
            type: 'uuid',
            isNullable: true,
            comment: 'Admin user who last updated this template',
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

    // Indexes for document_templates
    await queryRunner.createIndex(
      'document_templates',
      new Index({
        name: 'IDX_DOCUMENT_TEMPLATES_SLUG',
        columnNames: ['slug'],
      }),
    );

    await queryRunner.createIndex(
      'document_templates',
      new Index({
        name: 'IDX_DOCUMENT_TEMPLATES_CATEGORY',
        columnNames: ['category'],
      }),
    );

    await queryRunner.createIndex(
      'document_templates',
      new Index({
        name: 'IDX_DOCUMENT_TEMPLATES_IS_PUBLISHED',
        columnNames: ['is_published'],
      }),
    );

    // ============================================
    // TABLE: onboarding_steps
    // ============================================
    await queryRunner.createTable(
      new Table({
        name: 'onboarding_steps',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_type',
            type: 'enum',
            enum: ['client', 'lawyer'],
            comment: 'Which user type this onboarding is for',
          },
          {
            name: 'step_number',
            type: 'int',
            comment: 'Step order',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
            comment: 'Step title',
          },
          {
            name: 'description',
            type: 'text',
            comment: 'Step description',
          },
          {
            name: 'image_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: 'Step illustration image',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            comment: 'Whether this step is shown',
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

    // Indexes for onboarding_steps
    await queryRunner.createIndex(
      'onboarding_steps',
      new Index({
        name: 'IDX_ONBOARDING_STEPS_USER_TYPE',
        columnNames: ['user_type', 'step_number'],
      }),
    );

    await queryRunner.createIndex(
      'onboarding_steps',
      new Index({
        name: 'IDX_ONBOARDING_STEPS_IS_ACTIVE',
        columnNames: ['is_active'],
      }),
    );

    // Check constraints
    await queryRunner.query(`
      ALTER TABLE faq
      ADD CONSTRAINT CHK_FAQ_COUNTS_NON_NEGATIVE
      CHECK (
        view_count >= 0 AND
        helpful_count >= 0 AND
        not_helpful_count >= 0
      )
    `);

    await queryRunner.query(`
      ALTER TABLE legal_pages
      ADD CONSTRAINT CHK_LEGAL_PAGES_VERSION
      CHECK (version > 0)
    `);

    await queryRunner.query(`
      ALTER TABLE document_templates
      ADD CONSTRAINT CHK_DOCUMENT_TEMPLATES_USAGE
      CHECK (usage_count >= 0)
    `);

    await queryRunner.query(`
      ALTER TABLE onboarding_steps
      ADD CONSTRAINT CHK_ONBOARDING_STEPS_STEP_NUMBER
      CHECK (step_number > 0)
    `);

    // Unique constraint for onboarding steps
    await queryRunner.query(`
      ALTER TABLE onboarding_steps
      ADD CONSTRAINT UQ_ONBOARDING_STEPS_USER_STEP
      UNIQUE (user_type, step_number)
    `);

    // Comments
    await queryRunner.query(`
      COMMENT ON TABLE faq IS 'Frequently asked questions with voting and analytics';
    `);

    await queryRunner.query(`
      COMMENT ON TABLE legal_pages IS 'Legal documents and policy pages with versioning';
    `);

    await queryRunner.query(`
      COMMENT ON TABLE support_tickets IS 'Customer support ticket management system';
    `);

    await queryRunner.query(`
      COMMENT ON TABLE document_templates IS 'Reusable legal document templates';
    `);

    await queryRunner.query(`
      COMMENT ON TABLE onboarding_steps IS 'Onboarding flow configuration for mobile app';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.dropForeignKey(
      'support_tickets',
      'FK_SUPPORT_TICKETS_USER',
    );

    // Drop indexes
    await queryRunner.dropIndex(
      'onboarding_steps',
      'IDX_ONBOARDING_STEPS_IS_ACTIVE',
    );
    await queryRunner.dropIndex(
      'onboarding_steps',
      'IDX_ONBOARDING_STEPS_USER_TYPE',
    );

    await queryRunner.dropIndex(
      'document_templates',
      'IDX_DOCUMENT_TEMPLATES_IS_PUBLISHED',
    );
    await queryRunner.dropIndex(
      'document_templates',
      'IDX_DOCUMENT_TEMPLATES_CATEGORY',
    );
    await queryRunner.dropIndex(
      'document_templates',
      'IDX_DOCUMENT_TEMPLATES_SLUG',
    );

    await queryRunner.dropIndex(
      'support_tickets',
      'IDX_SUPPORT_TICKETS_CREATED_AT',
    );
    await queryRunner.dropIndex(
      'support_tickets',
      'IDX_SUPPORT_TICKETS_ASSIGNED_TO',
    );
    await queryRunner.dropIndex(
      'support_tickets',
      'IDX_SUPPORT_TICKETS_CATEGORY',
    );
    await queryRunner.dropIndex(
      'support_tickets',
      'IDX_SUPPORT_TICKETS_PRIORITY',
    );
    await queryRunner.dropIndex('support_tickets', 'IDX_SUPPORT_TICKETS_STATUS');
    await queryRunner.dropIndex(
      'support_tickets',
      'IDX_SUPPORT_TICKETS_USER_ID',
    );
    await queryRunner.dropIndex(
      'support_tickets',
      'IDX_SUPPORT_TICKETS_TICKET_NUMBER',
    );

    await queryRunner.dropIndex('legal_pages', 'IDX_LEGAL_PAGES_IS_PUBLISHED');
    await queryRunner.dropIndex('legal_pages', 'IDX_LEGAL_PAGES_SLUG');

    await queryRunner.dropIndex('faq', 'IDX_FAQ_CATEGORY_PUBLISHED');
    await queryRunner.dropIndex('faq', 'IDX_FAQ_SORT_ORDER');
    await queryRunner.dropIndex('faq', 'IDX_FAQ_IS_PUBLISHED');
    await queryRunner.dropIndex('faq', 'IDX_FAQ_CATEGORY');

    // Drop tables
    await queryRunner.dropTable('onboarding_steps');
    await queryRunner.dropTable('document_templates');
    await queryRunner.dropTable('support_tickets');
    await queryRunner.dropTable('legal_pages');
    await queryRunner.dropTable('faq');
  }
}
