import { AggregateRoot } from '../../../../shared/domain/aggregate-root';
import { Result } from '../../../../shared/domain/result';

export interface DocumentChunkProps {
  id: string;
  documentId: string;
  content: string;
  embedding: number[];
  pageNumber?: number;
  chunkIndex: number;
  metadata: Record<string, any>;
  createdAt: Date;
}

export class DocumentChunk extends AggregateRoot<string> {
  private _documentId: string;
  private _content: string;
  private _embedding: number[];
  private _pageNumber?: number;
  private _chunkIndex: number;
  private _metadata: Record<string, any>;
  private _createdAt: Date;

  private constructor(props: DocumentChunkProps) {
    super(props.id);
    this._documentId = props.documentId;
    this._content = props.content;
    this._embedding = props.embedding;
    this._pageNumber = props.pageNumber;
    this._chunkIndex = props.chunkIndex;
    this._metadata = props.metadata;
    this._createdAt = props.createdAt;
  }

  public static create(
    id: string,
    documentId: string,
    content: string,
    embedding: number[],
    chunkIndex: number,
    pageNumber?: number,
    metadata: Record<string, any> = {},
  ): Result<DocumentChunk> {
    // Validation
    if (!content || content.trim().length === 0) {
      return Result.fail('Chunk content is required');
    }

    if (content.length > 10000) {
      return Result.fail('Chunk content is too long (max 10000 characters)');
    }

    if (!embedding || embedding.length === 0) {
      return Result.fail('Embedding is required');
    }

    if (chunkIndex < 0) {
      return Result.fail('Chunk index must be non-negative');
    }

    const chunk = new DocumentChunk({
      id,
      documentId,
      content: content.trim(),
      embedding,
      pageNumber,
      chunkIndex,
      metadata,
      createdAt: new Date(),
    });

    return Result.ok(chunk);
  }

  // Getters
  get documentId(): string {
    return this._documentId;
  }

  get content(): string {
    return this._content;
  }

  get embedding(): number[] {
    return [...this._embedding];
  }

  get pageNumber(): number | undefined {
    return this._pageNumber;
  }

  get chunkIndex(): number {
    return this._chunkIndex;
  }

  get metadata(): Record<string, any> {
    return { ...this._metadata };
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
