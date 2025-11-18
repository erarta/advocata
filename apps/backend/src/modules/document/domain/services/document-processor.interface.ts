import { DocumentType } from '../entities/document.entity';

export interface ExtractedContent {
  text: string;
  pageCount?: number;
  metadata: Record<string, any>;
}

export interface TextChunk {
  content: string;
  pageNumber?: number;
  metadata: Record<string, any>;
}

export interface IDocumentProcessor {
  /**
   * Extract text content from document
   */
  extractContent(fileBuffer: Buffer, fileType: DocumentType): Promise<ExtractedContent>;

  /**
   * Split text into chunks for embedding
   */
  chunkText(text: string, chunkSize?: number, overlap?: number): Promise<TextChunk[]>;

  /**
   * Generate embeddings for text chunks
   */
  generateEmbeddings(chunks: string[]): Promise<number[][]>;
}
