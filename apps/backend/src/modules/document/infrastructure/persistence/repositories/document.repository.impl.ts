import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, In } from 'typeorm';
import {
  DocumentRepository,
  DocumentSearchCriteria,
} from '../../../domain/repositories/document.repository';
import { Document } from '../../../domain/entities/document.entity';
import { DocumentChunk } from '../../../domain/entities/document-chunk.entity';
import { DocumentOrmEntity } from '../entities/document.orm-entity';
import { DocumentChunkOrmEntity } from '../entities/document-chunk.orm-entity';
import { DocumentMapper } from '../mappers/document.mapper';
import { DocumentChunkMapper } from '../mappers/document-chunk.mapper';

@Injectable()
export class DocumentRepositoryImpl implements DocumentRepository {
  constructor(
    @InjectRepository(DocumentOrmEntity)
    private readonly documentRepository: Repository<DocumentOrmEntity>,
    @InjectRepository(DocumentChunkOrmEntity)
    private readonly chunkRepository: Repository<DocumentChunkOrmEntity>,
  ) {}

  async save(document: Document): Promise<void> {
    const ormEntity = DocumentMapper.toOrmEntity(document);
    await this.documentRepository.save(ormEntity);
  }

  async findById(id: string): Promise<Document | null> {
    const ormEntity = await this.documentRepository.findOne({
      where: { id },
    });

    if (!ormEntity) {
      return null;
    }

    return DocumentMapper.toDomain(ormEntity);
  }

  async findByLawyerId(lawyerId: string): Promise<Document[]> {
    const ormEntities = await this.documentRepository.find({
      where: { lawyerId },
      order: { createdAt: 'DESC' },
    });

    return ormEntities.map((entity) => DocumentMapper.toDomain(entity));
  }

  async search(
    criteria: DocumentSearchCriteria,
  ): Promise<{ documents: Document[]; total: number }> {
    const queryBuilder = this.documentRepository.createQueryBuilder('document');

    // Apply filters
    if (criteria.lawyerId) {
      queryBuilder.andWhere('document.lawyerId = :lawyerId', {
        lawyerId: criteria.lawyerId,
      });
    }

    if (criteria.category) {
      queryBuilder.andWhere('document.category = :category', {
        category: criteria.category,
      });
    }

    if (criteria.status) {
      queryBuilder.andWhere('document.status = :status', {
        status: criteria.status,
      });
    }

    if (criteria.isPublic !== undefined) {
      queryBuilder.andWhere('document.isPublic = :isPublic', {
        isPublic: criteria.isPublic,
      });
    }

    if (criteria.tags && criteria.tags.length > 0) {
      queryBuilder.andWhere('document.tags && :tags', {
        tags: criteria.tags,
      });
    }

    if (criteria.search) {
      queryBuilder.andWhere(
        '(document.title ILIKE :search OR document.description ILIKE :search)',
        { search: `%${criteria.search}%` },
      );
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    queryBuilder
      .orderBy('document.createdAt', 'DESC')
      .skip(criteria.offset || 0)
      .take(criteria.limit || 20);

    const ormEntities = await queryBuilder.getMany();
    const documents = ormEntities.map((entity) =>
      DocumentMapper.toDomain(entity),
    );

    return { documents, total };
  }

  async delete(id: string): Promise<void> {
    await this.documentRepository.delete({ id });
  }

  // Chunk operations
  async saveChunk(chunk: DocumentChunk): Promise<void> {
    const ormEntity = DocumentChunkMapper.toOrmEntity(chunk);
    await this.chunkRepository.save(ormEntity);
  }

  async saveChunks(chunks: DocumentChunk[]): Promise<void> {
    const ormEntities = chunks.map((chunk) =>
      DocumentChunkMapper.toOrmEntity(chunk),
    );
    await this.chunkRepository.save(ormEntities);
  }

  async findChunksByDocumentId(documentId: string): Promise<DocumentChunk[]> {
    const ormEntities = await this.chunkRepository.find({
      where: { documentId },
      order: { chunkIndex: 'ASC' },
    });

    return ormEntities.map((entity) => DocumentChunkMapper.toDomain(entity));
  }

  async searchSimilarChunks(
    embedding: number[],
    limit: number,
    lawyerId?: string,
  ): Promise<DocumentChunk[]> {
    // Note: This is a simplified cosine similarity search
    // In production, use pgvector extension with <=> operator for better performance

    let query = `
      SELECT
        c.id,
        c."documentId",
        c.content,
        c.embedding,
        c."pageNumber",
        c."chunkIndex",
        c.metadata,
        c."createdAt",
        (1 - (
          (string_to_array(c.embedding, ',')::float8[] <#> $1::float8[]) /
          (sqrt(array_length(string_to_array(c.embedding, ','), 1)) * sqrt(array_length($1, 1)))
        )) as similarity
      FROM document_chunks c
    `;

    const params: any[] = [embedding];

    // If lawyerId provided, filter by lawyer's documents
    if (lawyerId) {
      query += `
        INNER JOIN documents d ON c."documentId" = d.id
        WHERE d."lawyerId" = $2 OR d."isPublic" = true
      `;
      params.push(lawyerId);
    }

    query += `
      ORDER BY similarity DESC
      LIMIT $${params.length + 1}
    `;
    params.push(limit);

    const results = await this.chunkRepository.query(query, params);

    return results.map((row: any) => {
      const ormEntity = new DocumentChunkOrmEntity();
      ormEntity.id = row.id;
      ormEntity.documentId = row.documentId;
      ormEntity.content = row.content;
      ormEntity.embedding = row.embedding;
      ormEntity.pageNumber = row.pageNumber;
      ormEntity.chunkIndex = row.chunkIndex;
      ormEntity.metadata = row.metadata;
      ormEntity.createdAt = row.createdAt;

      return DocumentChunkMapper.toDomain(ormEntity);
    });
  }

  async deleteChunksByDocumentId(documentId: string): Promise<void> {
    await this.chunkRepository.delete({ documentId });
  }
}
