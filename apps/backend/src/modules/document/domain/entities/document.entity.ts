import { AggregateRoot } from '../../../../shared/domain/aggregate-root';
import { Result } from '../../../../shared/domain/result';
import { DocumentCreatedEvent } from '../events/document-created.event';
import { DocumentProcessedEvent } from '../events/document-processed.event';

export enum DocumentType {
  PDF = 'pdf',
  IMAGE = 'image',
  TEXT = 'text',
}

export enum DocumentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum DocumentCategory {
  CONTRACT = 'contract',
  COURT_DECISION = 'court_decision',
  LAW = 'law',
  REGULATION = 'regulation',
  TEMPLATE = 'template',
  GUIDE = 'guide',
  OTHER = 'other',
}

export interface DocumentProps {
  id: string;
  lawyerId: string;
  title: string;
  description?: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  type: DocumentType;
  category: DocumentCategory;
  status: DocumentStatus;
  isPublic: boolean;
  tags: string[];
  metadata: Record<string, any>;
  processedAt?: Date;
  errorMessage?: string;
  chunkCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Document extends AggregateRoot<string> {
  private _lawyerId: string;
  private _title: string;
  private _description?: string;
  private _fileName: string;
  private _fileUrl: string;
  private _fileSize: number;
  private _mimeType: string;
  private _type: DocumentType;
  private _category: DocumentCategory;
  private _status: DocumentStatus;
  private _isPublic: boolean;
  private _tags: string[];
  private _metadata: Record<string, any>;
  private _processedAt?: Date;
  private _errorMessage?: string;
  private _chunkCount?: number;
  private _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: DocumentProps) {
    super(props.id);
    this._lawyerId = props.lawyerId;
    this._title = props.title;
    this._description = props.description;
    this._fileName = props.fileName;
    this._fileUrl = props.fileUrl;
    this._fileSize = props.fileSize;
    this._mimeType = props.mimeType;
    this._type = props.type;
    this._category = props.category;
    this._status = props.status;
    this._isPublic = props.isPublic;
    this._tags = props.tags;
    this._metadata = props.metadata;
    this._processedAt = props.processedAt;
    this._errorMessage = props.errorMessage;
    this._chunkCount = props.chunkCount;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  public static create(
    id: string,
    lawyerId: string,
    title: string,
    fileName: string,
    fileUrl: string,
    fileSize: number,
    mimeType: string,
    type: DocumentType,
    category: DocumentCategory,
    description?: string,
    isPublic: boolean = false,
    tags: string[] = [],
    metadata: Record<string, any> = {},
  ): Result<Document> {
    // Validation
    if (!title || title.trim().length === 0) {
      return Result.fail('Document title is required');
    }

    if (title.length > 200) {
      return Result.fail('Document title is too long (max 200 characters)');
    }

    if (!fileName || fileName.trim().length === 0) {
      return Result.fail('File name is required');
    }

    if (!fileUrl || fileUrl.trim().length === 0) {
      return Result.fail('File URL is required');
    }

    if (fileSize <= 0) {
      return Result.fail('File size must be greater than 0');
    }

    if (fileSize > 100 * 1024 * 1024) {
      // 100MB limit
      return Result.fail('File size exceeds maximum limit (100MB)');
    }

    const document = new Document({
      id,
      lawyerId,
      title: title.trim(),
      description: description?.trim(),
      fileName,
      fileUrl,
      fileSize,
      mimeType,
      type,
      category,
      status: DocumentStatus.PENDING,
      isPublic,
      tags,
      metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    document.addDomainEvent(
      new DocumentCreatedEvent(
        document.id,
        document.lawyerId,
        document.title,
        document.type,
      ),
    );

    return Result.ok(document);
  }

  public markAsProcessing(): Result<void> {
    if (this._status === DocumentStatus.COMPLETED) {
      return Result.fail('Document is already processed');
    }

    this._status = DocumentStatus.PROCESSING;
    this._updatedAt = new Date();

    return Result.ok();
  }

  public markAsCompleted(chunkCount: number): Result<void> {
    if (this._status !== DocumentStatus.PROCESSING) {
      return Result.fail('Document is not in processing state');
    }

    if (chunkCount <= 0) {
      return Result.fail('Chunk count must be greater than 0');
    }

    this._status = DocumentStatus.COMPLETED;
    this._chunkCount = chunkCount;
    this._processedAt = new Date();
    this._updatedAt = new Date();
    this._errorMessage = undefined;

    this.addDomainEvent(
      new DocumentProcessedEvent(
        this.id,
        this.lawyerId,
        chunkCount,
      ),
    );

    return Result.ok();
  }

  public markAsFailed(errorMessage: string): Result<void> {
    if (!errorMessage || errorMessage.trim().length === 0) {
      return Result.fail('Error message is required');
    }

    this._status = DocumentStatus.FAILED;
    this._errorMessage = errorMessage;
    this._updatedAt = new Date();

    return Result.ok();
  }

  public updateMetadata(metadata: Record<string, any>): Result<void> {
    this._metadata = { ...this._metadata, ...metadata };
    this._updatedAt = new Date();

    return Result.ok();
  }

  public addTags(tags: string[]): Result<void> {
    const uniqueTags = new Set([...this._tags, ...tags]);
    this._tags = Array.from(uniqueTags);
    this._updatedAt = new Date();

    return Result.ok();
  }

  public removeTags(tags: string[]): Result<void> {
    this._tags = this._tags.filter((tag) => !tags.includes(tag));
    this._updatedAt = new Date();

    return Result.ok();
  }

  public makePublic(): Result<void> {
    this._isPublic = true;
    this._updatedAt = new Date();
    return Result.ok();
  }

  public makePrivate(): Result<void> {
    this._isPublic = false;
    this._updatedAt = new Date();
    return Result.ok();
  }

  // Getters
  get lawyerId(): string {
    return this._lawyerId;
  }

  get title(): string {
    return this._title;
  }

  get description(): string | undefined {
    return this._description;
  }

  get fileName(): string {
    return this._fileName;
  }

  get fileUrl(): string {
    return this._fileUrl;
  }

  get fileSize(): number {
    return this._fileSize;
  }

  get mimeType(): string {
    return this._mimeType;
  }

  get type(): DocumentType {
    return this._type;
  }

  get category(): DocumentCategory {
    return this._category;
  }

  get status(): DocumentStatus {
    return this._status;
  }

  get isPublic(): boolean {
    return this._isPublic;
  }

  get tags(): string[] {
    return [...this._tags];
  }

  get metadata(): Record<string, any> {
    return { ...this._metadata };
  }

  get processedAt(): Date | undefined {
    return this._processedAt;
  }

  get errorMessage(): string | undefined {
    return this._errorMessage;
  }

  get chunkCount(): number | undefined {
    return this._chunkCount;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get isProcessed(): boolean {
    return this._status === DocumentStatus.COMPLETED;
  }

  get isProcessing(): boolean {
    return this._status === DocumentStatus.PROCESSING;
  }

  get hasFailed(): boolean {
    return this._status === DocumentStatus.FAILED;
  }
}
