import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FaqOrmEntity, FaqCategory } from './faq.orm-entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FaqRepository {
  constructor(
    @InjectRepository(FaqOrmEntity)
    private readonly repository: Repository<FaqOrmEntity>,
  ) {}

  async nextId(): Promise<string> {
    return uuidv4();
  }

  async findById(id: string): Promise<FaqOrmEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByCategory(category: FaqCategory): Promise<FaqOrmEntity[]> {
    return this.repository.find({
      where: { category, isActive: true },
      order: { order: 'ASC', createdAt: 'ASC' },
    });
  }

  async findActive(): Promise<FaqOrmEntity[]> {
    return this.repository.find({
      where: { isActive: true },
      order: { category: 'ASC', order: 'ASC' },
    });
  }

  async findAll(options?: {
    limit?: number;
    offset?: number;
    category?: FaqCategory;
    isActive?: boolean;
  }): Promise<{ faqs: FaqOrmEntity[]; total: number }> {
    const query = this.repository.createQueryBuilder('faq');

    if (options?.category) {
      query.andWhere('faq.category = :category', { category: options.category });
    }

    if (options?.isActive !== undefined) {
      query.andWhere('faq.isActive = :isActive', { isActive: options.isActive });
    }

    query.orderBy('faq.category', 'ASC').addOrderBy('faq.order', 'ASC');

    if (options?.limit) {
      query.limit(options.limit);
    }

    if (options?.offset) {
      query.offset(options.offset);
    }

    const [faqs, total] = await query.getManyAndCount();
    return { faqs, total };
  }

  async save(faq: FaqOrmEntity): Promise<FaqOrmEntity> {
    return this.repository.save(faq);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.repository.increment({ id }, 'viewCount', 1);
  }

  async incrementHelpfulCount(id: string): Promise<void> {
    await this.repository.increment({ id }, 'helpfulCount', 1);
  }
}
