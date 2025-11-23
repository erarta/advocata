import {
  MigrationInterface,
  QueryRunner,
  Table,
  Index,
  TableForeignKey,
} from 'typeorm';

/**
 * Create Documents Table Migration
 *
 * Creates the documents table with full schema for Document Management Context.
 * This table stores uploaded documents (PDFs, images, text files) with metadata,
 * processing status, and AI embeddings for semantic search.
 */
export class CreateDocumentsTable1700000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create documents table
    await queryRunner.createTable(
      new Table({
        name: 'documents',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'lawyerId',
            type: 'uuid',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '200',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'fileName',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'fileUrl',
            type: 'text',
            comment: 'Full URL to file in Supabase Storage',
          },
          {
            name: 'fileSize',
            type: 'bigint',
            comment: 'File size in bytes',
          },
          {
            name: 'mimeType',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['pdf', 'image', 'text'],
          },
          {
            name: 'category',
            type: 'enum',
            enum: [
              'contract',
              'court_decision',
              'law',
              'regulation',
              'template',
              'guide',
              'other',
            ],
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'processing', 'completed', 'failed'],
            default: "'pending'",
          },
          {
            name: 'isPublic',
            type: 'boolean',
            default: false,
            comment: 'Whether document is publicly accessible in knowledge base',
          },
          {
            name: 'tags',
            type: 'text',
            comment: 'Comma-separated list of tags',
          },
          {
            name: 'metadata',
            type: 'jsonb',
            default: "'{}'",
            comment: 'Additional metadata (author, date, jurisdiction, etc.)',
          },
          {
            name: 'processedAt',
            type: 'timestamp',
            isNullable: true,
            comment: 'When document processing completed',
          },
          {
            name: 'errorMessage',
            type: 'text',
            isNullable: true,
            comment: 'Error message if processing failed',
          },
          {
            name: 'chunkCount',
            type: 'int',
            isNullable: true,
            comment: 'Number of text chunks created for embeddings',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create foreign key to lawyers table
    await queryRunner.createForeignKey(
      'documents',
      new TableForeignKey({
        name: 'FK_DOCUMENTS_LAWYER',
        columnNames: ['lawyerId'],
        referencedTableName: 'lawyers',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Create indexes for performance
    await queryRunner.createIndex(
      'documents',
      new Index({
        name: 'IDX_DOCUMENTS_LAWYER_ID',
        columnNames: ['lawyerId'],
      }),
    );

    await queryRunner.createIndex(
      'documents',
      new Index({
        name: 'IDX_DOCUMENTS_STATUS',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'documents',
      new Index({
        name: 'IDX_DOCUMENTS_IS_PUBLIC',
        columnNames: ['isPublic'],
      }),
    );

    await queryRunner.createIndex(
      'documents',
      new Index({
        name: 'IDX_DOCUMENTS_TYPE',
        columnNames: ['type'],
      }),
    );

    await queryRunner.createIndex(
      'documents',
      new Index({
        name: 'IDX_DOCUMENTS_CATEGORY',
        columnNames: ['category'],
      }),
    );

    await queryRunner.createIndex(
      'documents',
      new Index({
        name: 'IDX_DOCUMENTS_CREATED_AT',
        columnNames: ['createdAt'],
      }),
    );

    // Composite indexes for common queries
    await queryRunner.createIndex(
      'documents',
      new Index({
        name: 'IDX_DOCUMENTS_LAWYER_STATUS',
        columnNames: ['lawyerId', 'status'],
      }),
    );

    await queryRunner.createIndex(
      'documents',
      new Index({
        name: 'IDX_DOCUMENTS_CATEGORY_PUBLIC',
        columnNames: ['category', 'isPublic'],
      }),
    );

    await queryRunner.createIndex(
      'documents',
      new Index({
        name: 'IDX_DOCUMENTS_STATUS_CREATED',
        columnNames: ['status', 'createdAt'],
      }),
    );

    // Full-text search index on title and description
    await queryRunner.query(`
      CREATE INDEX IDX_DOCUMENTS_TITLE_SEARCH
      ON documents
      USING gin(to_tsvector('russian', title));
    `);

    await queryRunner.query(`
      CREATE INDEX IDX_DOCUMENTS_TAGS_SEARCH
      ON documents
      USING gin(to_tsvector('russian', tags));
    `);

    // Add check constraints
    await queryRunner.query(`
      ALTER TABLE documents
      ADD CONSTRAINT CHK_DOCUMENTS_FILE_SIZE_POSITIVE
      CHECK (
        "fileSize" > 0 AND
        "fileSize" <= 104857600
      )
    `);

    await queryRunner.query(`
      ALTER TABLE documents
      ADD CONSTRAINT CHK_DOCUMENTS_TITLE_NOT_EMPTY
      CHECK (
        LENGTH(TRIM(title)) > 0
      )
    `);

    await queryRunner.query(`
      ALTER TABLE documents
      ADD CONSTRAINT CHK_DOCUMENTS_CHUNK_COUNT_POSITIVE
      CHECK (
        "chunkCount" IS NULL OR
        "chunkCount" > 0
      )
    `);

    // Add comments to table and columns
    await queryRunner.query(`
      COMMENT ON TABLE documents IS 'Documents uploaded by lawyers for knowledge base and RAG (Retrieval Augmented Generation). Includes contracts, laws, court decisions, etc.';
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN documents."lawyerId" IS 'Lawyer who uploaded the document.';
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN documents.type IS 'Document file type: pdf, image, or text.';
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN documents.category IS 'Legal document category: contract, court_decision, law, regulation, template, guide, or other.';
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN documents.status IS 'Processing status: pending (uploaded), processing (being chunked), completed (ready), or failed.';
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN documents."isPublic" IS 'If true, document is available in public knowledge base for all lawyers.';
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN documents."chunkCount" IS 'Number of text chunks created from this document for vector embeddings.';
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN documents.metadata IS 'JSONB metadata: author, date, jurisdiction, source, etc.';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key
    await queryRunner.dropForeignKey('documents', 'FK_DOCUMENTS_LAWYER');

    // Drop full-text search indexes
    await queryRunner.query('DROP INDEX IF EXISTS IDX_DOCUMENTS_TITLE_SEARCH');
    await queryRunner.query('DROP INDEX IF EXISTS IDX_DOCUMENTS_TAGS_SEARCH');

    // Drop indexes
    await queryRunner.dropIndex('documents', 'IDX_DOCUMENTS_LAWYER_ID');
    await queryRunner.dropIndex('documents', 'IDX_DOCUMENTS_STATUS');
    await queryRunner.dropIndex('documents', 'IDX_DOCUMENTS_IS_PUBLIC');
    await queryRunner.dropIndex('documents', 'IDX_DOCUMENTS_TYPE');
    await queryRunner.dropIndex('documents', 'IDX_DOCUMENTS_CATEGORY');
    await queryRunner.dropIndex('documents', 'IDX_DOCUMENTS_CREATED_AT');
    await queryRunner.dropIndex('documents', 'IDX_DOCUMENTS_LAWYER_STATUS');
    await queryRunner.dropIndex('documents', 'IDX_DOCUMENTS_CATEGORY_PUBLIC');
    await queryRunner.dropIndex('documents', 'IDX_DOCUMENTS_STATUS_CREATED');

    // Drop table
    await queryRunner.dropTable('documents');
  }
}
