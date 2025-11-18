import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Document, DocumentType, DocumentStatus, DocumentCategory } from '../../domain/entities/document.entity';

export class DocumentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  lawyerId: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  fileName: string;

  @ApiProperty()
  fileUrl: string;

  @ApiProperty()
  fileSize: number;

  @ApiProperty()
  mimeType: string;

  @ApiProperty({ enum: DocumentType })
  type: DocumentType;

  @ApiProperty({ enum: DocumentCategory })
  category: DocumentCategory;

  @ApiProperty({ enum: DocumentStatus })
  status: DocumentStatus;

  @ApiProperty()
  isPublic: boolean;

  @ApiProperty({ type: [String] })
  tags: string[];

  @ApiProperty()
  metadata: Record<string, any>;

  @ApiPropertyOptional()
  processedAt?: Date;

  @ApiPropertyOptional()
  errorMessage?: string;

  @ApiPropertyOptional()
  chunkCount?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromDomain(document: Document): DocumentResponseDto {
    return {
      id: document.id,
      lawyerId: document.lawyerId,
      title: document.title,
      description: document.description,
      fileName: document.fileName,
      fileUrl: document.fileUrl,
      fileSize: document.fileSize,
      mimeType: document.mimeType,
      type: document.type,
      category: document.category,
      status: document.status,
      isPublic: document.isPublic,
      tags: document.tags,
      metadata: document.metadata,
      processedAt: document.processedAt,
      errorMessage: document.errorMessage,
      chunkCount: document.chunkCount,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
}

export class SearchDocumentsResponseDto {
  @ApiProperty({ type: [DocumentResponseDto] })
  documents: DocumentResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

export class UploadDocumentResponseDto {
  @ApiProperty()
  documentId: string;

  @ApiProperty()
  fileUrl: string;

  @ApiProperty()
  message: string;
}
