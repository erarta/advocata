import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { SearchDocumentsQuery } from './search-documents.query';
import { DocumentRepository } from '../../../domain/repositories/document.repository';
import { Document } from '../../../domain/entities/document.entity';

export interface SearchDocumentsResult {
  documents: Document[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@QueryHandler(SearchDocumentsQuery)
@Injectable()
export class SearchDocumentsHandler implements IQueryHandler<SearchDocumentsQuery, SearchDocumentsResult> {
  constructor(private readonly documentRepository: DocumentRepository) {}

  async execute(query: SearchDocumentsQuery): Promise<SearchDocumentsResult> {
    const { documents, total } = await this.documentRepository.search({
      lawyerId: query.lawyerId,
      type: query.type,
      category: query.category,
      status: query.status,
      isPublic: query.isPublic,
      tags: query.tags,
      searchTerm: query.searchTerm,
      page: query.page,
      limit: query.limit,
    });

    return {
      documents,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }
}
