import { Document, DocumentProps } from '../../../domain/entities/document.entity';
import { DocumentOrmEntity } from '../entities/document.orm-entity';

export class DocumentMapper {
  public static toDomain(ormEntity: DocumentOrmEntity): Document {
    const props: DocumentProps = {
      id: ormEntity.id,
      lawyerId: ormEntity.lawyerId,
      title: ormEntity.title,
      description: ormEntity.description,
      fileName: ormEntity.fileName,
      fileUrl: ormEntity.fileUrl,
      fileSize: Number(ormEntity.fileSize),
      mimeType: ormEntity.mimeType,
      type: ormEntity.type,
      category: ormEntity.category,
      status: ormEntity.status,
      isPublic: ormEntity.isPublic,
      tags: ormEntity.tags || [],
      metadata: ormEntity.metadata || {},
      processedAt: ormEntity.processedAt,
      errorMessage: ormEntity.errorMessage,
      chunkCount: ormEntity.chunkCount,
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
    };

    // Use reflection to create Document instance
    return Object.create(Document.prototype, {
      _id: { value: props.id, writable: false },
      _lawyerId: { value: props.lawyerId, writable: true },
      _title: { value: props.title, writable: true },
      _description: { value: props.description, writable: true },
      _fileName: { value: props.fileName, writable: true },
      _fileUrl: { value: props.fileUrl, writable: true },
      _fileSize: { value: props.fileSize, writable: true },
      _mimeType: { value: props.mimeType, writable: true },
      _type: { value: props.type, writable: true },
      _category: { value: props.category, writable: true },
      _status: { value: props.status, writable: true },
      _isPublic: { value: props.isPublic, writable: true },
      _tags: { value: props.tags, writable: true },
      _metadata: { value: props.metadata, writable: true },
      _processedAt: { value: props.processedAt, writable: true },
      _errorMessage: { value: props.errorMessage, writable: true },
      _chunkCount: { value: props.chunkCount, writable: true },
      _createdAt: { value: props.createdAt, writable: true },
      _updatedAt: { value: props.updatedAt, writable: true },
    });
  }

  public static toOrmEntity(document: Document): DocumentOrmEntity {
    const ormEntity = new DocumentOrmEntity();

    ormEntity.id = document.id;
    ormEntity.lawyerId = document.lawyerId;
    ormEntity.title = document.title;
    ormEntity.description = document.description;
    ormEntity.fileName = document.fileName;
    ormEntity.fileUrl = document.fileUrl;
    ormEntity.fileSize = document.fileSize;
    ormEntity.mimeType = document.mimeType;
    ormEntity.type = document.type;
    ormEntity.category = document.category;
    ormEntity.status = document.status;
    ormEntity.isPublic = document.isPublic;
    ormEntity.tags = document.tags;
    ormEntity.metadata = document.metadata;
    ormEntity.processedAt = document.processedAt;
    ormEntity.errorMessage = document.errorMessage;
    ormEntity.chunkCount = document.chunkCount;
    ormEntity.createdAt = document.createdAt;
    ormEntity.updatedAt = document.updatedAt;

    return ormEntity;
  }
}
