import {
  MigrationInterface,
  QueryRunner,
  Table,
  Index,
  TableForeignKey,
} from 'typeorm';

/**
 * Create Document Chunks Table Migration
 *
 * Creates the document_chunks table for storing text chunks with vector embeddings.
 * This table enables RAG (Retrieval Augmented Generation) by storing document
 * fragments with their semantic embeddings for similarity search.
 *
 * NOTE: In production, use pgvector extension for proper vector storage and
 * similarity search with KNN/ANN indexes.
 */
export class CreateDocumentChunksTable1700000000006
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create document_chunks table
    await queryRunner.createTable(
      new Table({
        name: 'document_chunks',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'documentId',
            type: 'uuid',
          },
          {
            name: 'content',
            type: 'text',
            comment: 'Text content of the chunk (typically 500-1000 tokens)',
          },
          {
            name: 'embedding',
            type: 'text',
            comment:
              'Comma-separated vector embedding as string. In production, use pgvector extension with vector type.',
          },
          {
            name: 'pageNumber',
            type: 'int',
            isNullable: true,
            comment: 'Page number in original document (for PDFs)',
          },
          {
            name: 'chunkIndex',
            type: 'int',
            comment: 'Sequential index of chunk within document (0-based)',
          },
          {
            name: 'metadata',
            type: 'jsonb',
            default: "'{}'",
            comment: 'Additional metadata (section, title, keywords, etc.)',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create foreign key to documents table
    await queryRunner.createForeignKey(
      'document_chunks',
      new TableForeignKey({
        name: 'FK_DOCUMENT_CHUNKS_DOCUMENT',
        columnNames: ['documentId'],
        referencedTableName: 'documents',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Create indexes for performance
    await queryRunner.createIndex(
      'document_chunks',
      new Index({
        name: 'IDX_DOCUMENT_CHUNKS_DOCUMENT_ID',
        columnNames: ['documentId'],
      }),
    );

    await queryRunner.createIndex(
      'document_chunks',
      new Index({
        name: 'IDX_DOCUMENT_CHUNKS_PAGE_NUMBER',
        columnNames: ['pageNumber'],
      }),
    );

    await queryRunner.createIndex(
      'document_chunks',
      new Index({
        name: 'IDX_DOCUMENT_CHUNKS_CHUNK_INDEX',
        columnNames: ['chunkIndex'],
      }),
    );

    await queryRunner.createIndex(
      'document_chunks',
      new Index({
        name: 'IDX_DOCUMENT_CHUNKS_CREATED_AT',
        columnNames: ['createdAt'],
      }),
    );

    // Composite index for document navigation
    await queryRunner.createIndex(
      'document_chunks',
      new Index({
        name: 'IDX_DOCUMENT_CHUNKS_DOCUMENT_INDEX',
        columnNames: ['documentId', 'chunkIndex'],
      }),
    );

    // Full-text search index on content
    await queryRunner.query(`
      CREATE INDEX IDX_DOCUMENT_CHUNKS_CONTENT_SEARCH
      ON document_chunks
      USING gin(to_tsvector('russian', content));
    `);

    // Add check constraints
    await queryRunner.query(`
      ALTER TABLE document_chunks
      ADD CONSTRAINT CHK_DOCUMENT_CHUNKS_CONTENT_NOT_EMPTY
      CHECK (
        LENGTH(TRIM(content)) > 0
      )
    `);

    await queryRunner.query(`
      ALTER TABLE document_chunks
      ADD CONSTRAINT CHK_DOCUMENT_CHUNKS_CHUNK_INDEX_POSITIVE
      CHECK (
        "chunkIndex" >= 0
      )
    `);

    await queryRunner.query(`
      ALTER TABLE document_chunks
      ADD CONSTRAINT CHK_DOCUMENT_CHUNKS_PAGE_NUMBER_POSITIVE
      CHECK (
        "pageNumber" IS NULL OR
        "pageNumber" > 0
      )
    `);

    // Add comments to table and columns
    await queryRunner.query(`
      COMMENT ON TABLE document_chunks IS 'Text chunks from documents with vector embeddings for semantic search and RAG (Retrieval Augmented Generation).';
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN document_chunks."documentId" IS 'Reference to parent document.';
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN document_chunks.content IS 'Text content of chunk, typically 500-1000 tokens for optimal embedding quality.';
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN document_chunks.embedding IS 'Vector embedding as comma-separated string. Use OpenAI text-embedding-3-small (1536 dimensions) or similar. In production, migrate to pgvector extension for efficient similarity search.';
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN document_chunks."chunkIndex" IS 'Sequential order of chunk within document (0-based). Used for reconstructing original document order.';
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN document_chunks."pageNumber" IS 'Original page number in source document (for PDFs). Null for text files and images.';
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN document_chunks.metadata IS 'JSONB metadata: section title, keywords, named entities, relevance score, etc.';
    `);

    // Add note about pgvector migration
    await queryRunner.query(`
      COMMENT ON COLUMN document_chunks.embedding IS 'IMPORTANT: This is a temporary solution using comma-separated strings. For production, install pgvector extension and migrate to vector type for efficient KNN/ANN search with HNSW or IVFFlat indexes.';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key
    await queryRunner.dropForeignKey(
      'document_chunks',
      'FK_DOCUMENT_CHUNKS_DOCUMENT',
    );

    // Drop full-text search index
    await queryRunner.query(
      'DROP INDEX IF EXISTS IDX_DOCUMENT_CHUNKS_CONTENT_SEARCH',
    );

    // Drop indexes
    await queryRunner.dropIndex(
      'document_chunks',
      'IDX_DOCUMENT_CHUNKS_DOCUMENT_ID',
    );
    await queryRunner.dropIndex(
      'document_chunks',
      'IDX_DOCUMENT_CHUNKS_PAGE_NUMBER',
    );
    await queryRunner.dropIndex(
      'document_chunks',
      'IDX_DOCUMENT_CHUNKS_CHUNK_INDEX',
    );
    await queryRunner.dropIndex(
      'document_chunks',
      'IDX_DOCUMENT_CHUNKS_CREATED_AT',
    );
    await queryRunner.dropIndex(
      'document_chunks',
      'IDX_DOCUMENT_CHUNKS_DOCUMENT_INDEX',
    );

    // Drop table
    await queryRunner.dropTable('document_chunks');
  }
}
