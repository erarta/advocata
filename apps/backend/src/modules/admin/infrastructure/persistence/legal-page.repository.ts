import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LegalPageOrmEntity, LegalPageType, LegalPageStatus } from './legal-page.orm-entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LegalPageRepository {
  constructor(
    @InjectRepository(LegalPageOrmEntity)
    private readonly repository: Repository<LegalPageOrmEntity>,
  ) {}

  async nextId(): Promise<string> {
    return uuidv4();
  }

  async findById(id: string): Promise<LegalPageOrmEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findBySlug(slug: string): Promise<LegalPageOrmEntity | null> {
    return this.repository.findOne({ where: { slug } });
  }

  async findByType(type: LegalPageType): Promise<LegalPageOrmEntity[]> {
    return this.repository.find({ where: { type }, order: { createdAt: 'DESC' } });
  }

  async findPublished(): Promise<LegalPageOrmEntity[]> {
    return this.repository.find({
      where: { status: LegalPageStatus.PUBLISHED },
      order: { publishedAt: 'DESC' },
    });
  }

  async findAll(options?: {
    limit?: number;
    offset?: number;
    status?: LegalPageStatus;
    type?: LegalPageType;
  }): Promise<{ pages: LegalPageOrmEntity[]; total: number }> {
    const query = this.repository.createQueryBuilder('page');

    if (options?.status) {
      query.andWhere('page.status = :status', { status: options.status });
    }

    if (options?.type) {
      query.andWhere('page.type = :type', { type: options.type });
    }

    query.orderBy('page.createdAt', 'DESC');

    if (options?.limit) {
      query.limit(options.limit);
    }

    if (options?.offset) {
      query.offset(options.offset);
    }

    const [pages, total] = await query.getManyAndCount();
    return { pages, total };
  }

  async save(page: LegalPageOrmEntity): Promise<LegalPageOrmEntity> {
    return this.repository.save(page);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
