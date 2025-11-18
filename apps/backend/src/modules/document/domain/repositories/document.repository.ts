import { Document, DocumentCategory, DocumentStatus } from '../entities/document.entity';
import { DocumentChunk } from '../entities/document-chunk.entity';

export interface DocumentSearchCriteria {
  lawyerId?: string;
  category?: DocumentCategory;
  status?: DocumentStatus;
  isPublic?: boolean;
  tags?: string[];
  search?: string;
  limit?: number;
  offset?: number;
}

export interface DocumentRepository {
  save(document: Document): Promise<void>;
  findById(id: string): Promise<Document | null>;
  findByLawyerId(lawyerId: string): Promise<Document[]>;
  search(criteria: DocumentSearchCriteria): Promise<{ documents: Document[]; total: number }>;
  delete(id: string): Promise<void>;

  // Template operations
  getCategoryCounts(onlyPublic: boolean): Promise<Record<DocumentCategory, number>>;
  getPopular(limit: number, category?: string): Promise<Document[]>;

  // Chunk operations
  saveChunk(chunk: DocumentChunk): Promise<void>;
  saveChunks(chunks: DocumentChunk[]): Promise<void>;
  findChunksByDocumentId(documentId: string): Promise<DocumentChunk[]>;
  searchSimilarChunks(embedding: number[], limit: number, lawyerId?: string): Promise<DocumentChunk[]>;
  deleteChunksByDocumentId(documentId: string): Promise<void>;
}
