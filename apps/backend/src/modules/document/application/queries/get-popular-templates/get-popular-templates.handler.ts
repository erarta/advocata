import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { GetPopularTemplatesQuery } from './get-popular-templates.query';
import { DocumentRepository } from '../../../domain/repositories/document.repository';
import { Document } from '../../../domain/entities/document.entity';

export interface GetPopularTemplatesResult {
  templates: Document[];
}

@QueryHandler(GetPopularTemplatesQuery)
@Injectable()
export class GetPopularTemplatesHandler
  implements IQueryHandler<GetPopularTemplatesQuery, GetPopularTemplatesResult>
{
  constructor(private readonly documentRepository: DocumentRepository) {}

  async execute(query: GetPopularTemplatesQuery): Promise<GetPopularTemplatesResult> {
    const templates = await this.documentRepository.getPopular(query.limit, query.category);

    return { templates };
  }
}
