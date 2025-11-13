import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  ILawyerRepository,
  LawyerSearchCriteria,
} from '../../domain/repositories/lawyer.repository.interface';
import { Lawyer } from '../../domain/entities';
import { SpecializationType, LawyerStatus } from '../../domain/enums';
import { LawyerOrmEntity } from './lawyer.orm-entity';
import { LawyerMapper } from './lawyer.mapper';
import { v4 as uuidv4 } from 'uuid';

/**
 * LawyerRepository
 *
 * TypeORM implementation of ILawyerRepository
 */
@Injectable()
export class LawyerRepository implements ILawyerRepository {
  constructor(
    @InjectRepository(LawyerOrmEntity)
    private readonly repository: Repository<LawyerOrmEntity>,
  ) {}

  async nextId(): Promise<string> {
    return uuidv4();
  }

  async findById(id: string): Promise<Lawyer | null> {
    const ormEntity = await this.repository.findOne({ where: { id } });
    if (!ormEntity) return null;
    return LawyerMapper.toDomain(ormEntity);
  }

  async findByUserId(userId: string): Promise<Lawyer | null> {
    const ormEntity = await this.repository.findOne({ where: { userId } });
    if (!ormEntity) return null;
    return LawyerMapper.toDomain(ormEntity);
  }

  async findByLicenseNumber(licenseNumber: string): Promise<Lawyer | null> {
    const ormEntity = await this.repository.findOne({
      where: { licenseNumber },
    });
    if (!ormEntity) return null;
    return LawyerMapper.toDomain(ormEntity);
  }

  async search(criteria: LawyerSearchCriteria): Promise<{
    lawyers: Lawyer[];
    total: number;
  }> {
    const query = this.repository.createQueryBuilder('lawyer');

    // Filter by status
    if (criteria.status) {
      query.andWhere('lawyer.status = :status', { status: criteria.status });
    }

    // Filter by availability
    if (criteria.isAvailable !== undefined) {
      query.andWhere('lawyer.isAvailable = :isAvailable', {
        isAvailable: criteria.isAvailable,
      });
    }

    // Filter by minimum rating
    if (criteria.minRating) {
      query.andWhere('lawyer.ratingValue >= :minRating', {
        minRating: criteria.minRating,
      });
    }

    // Filter by minimum experience
    if (criteria.minExperience) {
      query.andWhere('lawyer.experienceYears >= :minExperience', {
        minExperience: criteria.minExperience,
      });
    }

    // Filter by specializations (at least one match)
    if (criteria.specializations && criteria.specializations.length > 0) {
      const specializationConditions = criteria.specializations
        .map((spec) => `lawyer.specializations LIKE '%${spec}%'`)
        .join(' OR ');
      query.andWhere(`(${specializationConditions})`);
    }

    // Order by rating and experience
    query.orderBy('lawyer.ratingValue', 'DESC');
    query.addOrderBy('lawyer.experienceYears', 'DESC');

    // Pagination
    if (criteria.limit) {
      query.limit(criteria.limit);
    }
    if (criteria.offset) {
      query.offset(criteria.offset);
    }

    const [ormEntities, total] = await query.getManyAndCount();
    const lawyers = ormEntities.map((entity) => LawyerMapper.toDomain(entity));

    return { lawyers, total };
  }

  async findPendingVerification(limit?: number): Promise<Lawyer[]> {
    const query = this.repository
      .createQueryBuilder('lawyer')
      .where('lawyer.verificationStatus IN (:...statuses)', {
        statuses: ['pending', 'in_review', 'documents_requested'],
      })
      .orderBy('lawyer.createdAt', 'ASC');

    if (limit) {
      query.limit(limit);
    }

    const ormEntities = await query.getMany();
    return ormEntities.map((entity) => LawyerMapper.toDomain(entity));
  }

  async save(lawyer: Lawyer): Promise<void> {
    const ormEntity = LawyerMapper.toOrm(lawyer);
    await this.repository.save(ormEntity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async existsByLicenseNumber(licenseNumber: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { licenseNumber },
    });
    return count > 0;
  }

  async findBySpecialization(
    specialization: SpecializationType,
    limit?: number,
  ): Promise<Lawyer[]> {
    const query = this.repository
      .createQueryBuilder('lawyer')
      .where('lawyer.specializations LIKE :spec', {
        spec: `%${specialization}%`,
      })
      .andWhere('lawyer.status = :status', { status: LawyerStatus.Active })
      .andWhere('lawyer.isAvailable = :available', { available: true })
      .orderBy('lawyer.ratingValue', 'DESC');

    if (limit) {
      query.limit(limit);
    }

    const ormEntities = await query.getMany();
    return ormEntities.map((entity) => LawyerMapper.toDomain(entity));
  }

  async findTopRated(limit: number = 10): Promise<Lawyer[]> {
    const ormEntities = await this.repository.find({
      where: {
        status: LawyerStatus.Active,
        isAvailable: true,
      },
      order: {
        ratingValue: 'DESC',
        reviewCount: 'DESC',
      },
      take: limit,
    });

    return ormEntities.map((entity) => LawyerMapper.toDomain(entity));
  }
}
