import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { GetDocumentQuery } from './get-document.query';
import { DocumentRepository } from '../../../domain/repositories/document.repository';
import { Document } from '../../../domain/entities/document.entity';

@QueryHandler(GetDocumentQuery)
@Injectable()
export class GetDocumentHandler implements IQueryHandler<GetDocumentQuery, Document> {
  constructor(private readonly documentRepository: DocumentRepository) {}

  async execute(query: GetDocumentQuery): Promise<Document> {
    const document = await this.documentRepository.findById(query.documentId);

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Authorization check: only owner or public documents
    if (query.requestingUserId) {
      const isOwner = document.lawyerId === query.requestingUserId;
      const isPublic = document.isPublic;

      if (!isOwner && !isPublic) {
        throw new ForbiddenException('Access denied: Document is private');
      }
    } else {
      // Unauthenticated users can only access public documents
      if (!document.isPublic) {
        throw new ForbiddenException('Access denied: Document is private');
      }
    }

    return document;
  }
}
