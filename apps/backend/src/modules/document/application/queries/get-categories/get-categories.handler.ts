import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { GetCategoriesQuery } from './get-categories.query';
import { DocumentRepository } from '../../../domain/repositories/document.repository';
import { DocumentCategory } from '../../../domain/entities/document.entity';

export interface CategoryInfo {
  category: DocumentCategory;
  count: number;
  name: string;
  nameRu: string;
  icon: string;
}

export interface GetCategoriesResult {
  categories: CategoryInfo[];
}

// Russian names and icons for each category
const CATEGORY_INFO: Record<DocumentCategory, { nameRu: string; icon: string }> = {
  [DocumentCategory.CONTRACT]: { nameRu: 'Договорная работа', icon: '📄' },
  [DocumentCategory.COURT_DECISION]: { nameRu: 'Судебные решения', icon: '⚖️' },
  [DocumentCategory.LAW]: { nameRu: 'Законодательство', icon: '📚' },
  [DocumentCategory.REGULATION]: { nameRu: 'Нормативные акты', icon: '📋' },
  [DocumentCategory.TEMPLATE]: { nameRu: 'Шаблоны документов', icon: '📝' },
  [DocumentCategory.GUIDE]: { nameRu: 'Руководства', icon: '📖' },
  [DocumentCategory.OTHER]: { nameRu: 'Иные', icon: '📁' },
};

@QueryHandler(GetCategoriesQuery)
@Injectable()
export class GetCategoriesHandler implements IQueryHandler<GetCategoriesQuery, GetCategoriesResult> {
  constructor(private readonly documentRepository: DocumentRepository) {}

  async execute(query: GetCategoriesQuery): Promise<GetCategoriesResult> {
    const counts = await this.documentRepository.getCategoryCounts(query.onlyPublic);

    const categories: CategoryInfo[] = Object.entries(counts).map(([category, count]) => ({
      category: category as DocumentCategory,
      count,
      name: category,
      nameRu: CATEGORY_INFO[category as DocumentCategory].nameRu,
      icon: CATEGORY_INFO[category as DocumentCategory].icon,
    }));

    // Sort by count descending
    categories.sort((a, b) => b.count - a.count);

    return { categories };
  }
}
