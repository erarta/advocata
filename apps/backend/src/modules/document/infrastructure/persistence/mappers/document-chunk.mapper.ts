import { DocumentChunk } from '../../../domain/entities/document-chunk.entity';
import { DocumentChunkOrmEntity } from '../entities/document-chunk.orm-entity';

export class DocumentChunkMapper {
  public static toDomain(ormEntity: DocumentChunkOrmEntity): DocumentChunk {
    // Parse embedding from comma-separated string to number array
    const embedding = ormEntity.embedding
      .split(',')
      .map((val) => parseFloat(val));

    // Use reflection to create DocumentChunk instance
    return Object.create(DocumentChunk.prototype, {
      _id: { value: ormEntity.id, writable: false },
      _documentId: { value: ormEntity.documentId, writable: true },
      _content: { value: ormEntity.content, writable: true },
      _embedding: { value: embedding, writable: true },
      _pageNumber: { value: ormEntity.pageNumber, writable: true },
      _chunkIndex: { value: ormEntity.chunkIndex, writable: true },
      _metadata: { value: ormEntity.metadata || {}, writable: true },
      _createdAt: { value: ormEntity.createdAt, writable: true },
    });
  }

  public static toOrmEntity(chunk: DocumentChunk): DocumentChunkOrmEntity {
    const ormEntity = new DocumentChunkOrmEntity();

    ormEntity.id = chunk.id;
    ormEntity.documentId = chunk.documentId;
    ormEntity.content = chunk.content;
    // Convert number array to comma-separated string
    ormEntity.embedding = chunk.embedding.join(',');
    ormEntity.pageNumber = chunk.pageNumber;
    ormEntity.chunkIndex = chunk.chunkIndex;
    ormEntity.metadata = chunk.metadata;
    ormEntity.createdAt = chunk.createdAt;

    return ormEntity;
  }
}
