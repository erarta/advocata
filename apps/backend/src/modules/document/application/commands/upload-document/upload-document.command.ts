import { DocumentType, DocumentCategory } from '../../../domain/entities/document.entity';

export class UploadDocumentCommand {
  constructor(
    public readonly lawyerId: string,
    public readonly title: string,
    public readonly fileName: string,
    public readonly fileBuffer: Buffer,
    public readonly mimeType: string,
    public readonly type: DocumentType,
    public readonly category: DocumentCategory,
    public readonly description?: string,
    public readonly isPublic: boolean = false,
    public readonly tags: string[] = [],
    public readonly metadata: Record<string, any> = {},
  ) {}
}
