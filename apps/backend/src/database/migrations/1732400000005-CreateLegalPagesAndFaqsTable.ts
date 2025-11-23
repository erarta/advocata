import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

/**
 * Create Legal Pages and FAQs Tables Migration
 */
export class CreateLegalPagesAndFaqsTable1732400000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create legal_pages table
    await queryRunner.createTable(
      new Table({
        name: 'legal_pages',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'title', type: 'varchar', length: '255', isNullable: false },
          { name: 'slug', type: 'varchar', length: '255', isUnique: true, isNullable: false },
          { name: 'type', type: 'varchar', length: '100', isNullable: false },
          { name: 'content', type: 'text', isNullable: false },
          { name: 'status', type: 'varchar', length: '50', default: "'draft'" },
          { name: 'version', type: 'int', default: 1 },
          { name: 'seoTitle', type: 'varchar', length: '255', isNullable: true },
          { name: 'seoDescription', type: 'text', isNullable: true },
          { name: 'seoKeywords', type: 'text', isNullable: true },
          { name: 'publishedAt', type: 'timestamp with time zone', isNullable: true },
          { name: 'publishedBy', type: 'uuid', isNullable: true },
          { name: 'metadata', type: 'jsonb', isNullable: true },
          { name: 'createdAt', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('legal_pages', new TableIndex({ name: 'IDX_LEGAL_PAGES_SLUG', columnNames: ['slug'] }));
    await queryRunner.createIndex('legal_pages', new TableIndex({ name: 'IDX_LEGAL_PAGES_TYPE', columnNames: ['type'] }));
    await queryRunner.createIndex('legal_pages', new TableIndex({ name: 'IDX_LEGAL_PAGES_STATUS', columnNames: ['status'] }));
    await queryRunner.createIndex('legal_pages', new TableIndex({ name: 'IDX_LEGAL_PAGES_PUBLISHED_AT', columnNames: ['publishedAt'] }));

    // Create faqs table
    await queryRunner.createTable(
      new Table({
        name: 'faqs',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'question', type: 'varchar', length: '500', isNullable: false },
          { name: 'answer', type: 'text', isNullable: false },
          { name: 'category', type: 'varchar', length: '100', default: "'general'" },
          { name: 'order', type: 'int', default: 0 },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'viewCount', type: 'int', default: 0 },
          { name: 'helpfulCount', type: 'int', default: 0 },
          { name: 'tags', type: 'text', array: true, isNullable: true },
          { name: 'language', type: 'varchar', length: '10', default: "'ru'" },
          { name: 'metadata', type: 'jsonb', isNullable: true },
          { name: 'createdAt', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('faqs', new TableIndex({ name: 'IDX_FAQS_CATEGORY', columnNames: ['category'] }));
    await queryRunner.createIndex('faqs', new TableIndex({ name: 'IDX_FAQS_IS_ACTIVE', columnNames: ['isActive'] }));

    console.log('✅ Created legal_pages and faqs tables');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('faqs');
    await queryRunner.dropTable('legal_pages');
    console.log('✅ Dropped legal_pages and faqs tables');
  }
}
