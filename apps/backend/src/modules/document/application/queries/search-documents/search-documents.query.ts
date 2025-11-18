import { DocumentType, DocumentStatus, DocumentCategory } from '../../../domain/entities/document.entity';

export class SearchDocumentsQuery {
  constructor(
    public readonly lawyerId?: string,
    public readonly type?: DocumentType,
    public readonly category?: DocumentCategory,
    public readonly status?: DocumentStatus,
    public readonly isPublic?: boolean,
    public readonly tags?: string[],
    public readonly searchTerm?: string,
    public readonly page: number = 1,
    public readonly limit: number = 20,
  ) {}
}
