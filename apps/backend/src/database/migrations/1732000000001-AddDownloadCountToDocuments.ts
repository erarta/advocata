import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

/**
 * Add Download Count Column to Documents Table
 *
 * Adds downloadCount column to track how many times a document/template
 * has been downloaded. This is used for showing "popular templates" and analytics.
 */
export class AddDownloadCountToDocuments1732000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add downloadCount column
    await queryRunner.addColumn(
      'documents',
      new TableColumn({
        name: 'downloadCount',
        type: 'int',
        default: 0,
        comment: 'Number of times this document has been downloaded',
      }),
    );

    // Create index for efficient sorting by download count
    await queryRunner.query(`
      CREATE INDEX IDX_DOCUMENTS_DOWNLOAD_COUNT
      ON documents ("downloadCount" DESC);
    `);

    // Create composite index for popular templates query
    await queryRunner.query(`
      CREATE INDEX IDX_DOCUMENTS_PUBLIC_DOWNLOAD_COUNT
      ON documents ("isPublic", "downloadCount" DESC)
      WHERE "isPublic" = true;
    `);

    // Initialize downloadCount for existing documents to 0
    await queryRunner.query(`
      UPDATE documents
      SET "downloadCount" = 0
      WHERE "downloadCount" IS NULL;
    `);

    console.log('✅ Added downloadCount column to documents table');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query('DROP INDEX IF EXISTS IDX_DOCUMENTS_PUBLIC_DOWNLOAD_COUNT');
    await queryRunner.query('DROP INDEX IF EXISTS IDX_DOCUMENTS_DOWNLOAD_COUNT');

    // Drop column
    await queryRunner.dropColumn('documents', 'downloadCount');

    console.log('✅ Removed downloadCount column from documents table');
  }
}
