import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { SearchSimilarDocumentsQuery } from './search-similar-documents.query';
import { DocumentRepository } from '../../../domain/repositories/document.repository';
import { DocumentChunk } from '../../../domain/entities/document-chunk.entity';
import { IDocumentProcessor } from '../../../domain/services/document-processor.service';

export interface SimilarChunkResult {
  chunk: DocumentChunk;
  documentId: string;
  similarity: number;
}

@QueryHandler(SearchSimilarDocumentsQuery)
@Injectable()
export class SearchSimilarDocumentsHandler
  implements IQueryHandler<SearchSimilarDocumentsQuery, SimilarChunkResult[]>
{
  private readonly logger = new Logger(SearchSimilarDocumentsHandler.name);

  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly documentProcessor: IDocumentProcessor,
  ) {}

  async execute(query: SearchSimilarDocumentsQuery): Promise<SimilarChunkResult[]> {
    try {
      // 1. Generate embedding for query text
      this.logger.log(`Generating embedding for query: "${query.queryText}"`);
      const embeddings = await this.documentProcessor.generateEmbeddings([query.queryText]);
      const queryEmbedding = embeddings[0];

      // 2. Search for similar chunks
      this.logger.log(`Searching for top ${query.limit} similar chunks`);
      const similarChunks = await this.documentRepository.searchSimilarChunks(
        queryEmbedding,
        query.limit,
        query.lawyerId,
      );

      this.logger.log(`Found ${similarChunks.length} similar chunks`);

      // 3. Calculate similarity scores and return results
      const results: SimilarChunkResult[] = similarChunks.map((chunk) => ({
        chunk,
        documentId: chunk.documentId,
        similarity: this.calculateCosineSimilarity(queryEmbedding, chunk.embedding),
      }));

      return results;
    } catch (error) {
      this.logger.error(`Error searching similar documents: ${error.message}`, error.stack);
      throw error;
    }
  }

  private calculateCosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      magnitude1 += vec1[i] * vec1[i];
      magnitude2 += vec2[i] * vec2[i];
    }

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }

    return dotProduct / (magnitude1 * magnitude2);
  }
}
