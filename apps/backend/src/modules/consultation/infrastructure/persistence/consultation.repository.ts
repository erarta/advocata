import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IConsultationRepository } from '../../domain/repositories/consultation.repository';
import { Consultation } from '../../domain/entities/consultation.entity';
import { ConsultationStatus } from '../../domain/enums';
import { ConsultationOrmEntity } from './consultation.orm-entity';
import { ConsultationMapper } from './consultation.mapper';

/**
 * Consultation Repository Implementation
 *
 * TypeORM implementation of IConsultationRepository
 */
@Injectable()
export class ConsultationRepository implements IConsultationRepository {
  constructor(
    @InjectRepository(ConsultationOrmEntity)
    private readonly repository: Repository<ConsultationOrmEntity>,
  ) {}

  async save(consultation: Consultation): Promise<void> {
    const ormEntity = ConsultationMapper.toOrm(consultation);
    await this.repository.save(ormEntity);
  }

  async findById(id: string): Promise<Consultation | null> {
    const ormEntity = await this.repository.findOne({ where: { id } });
    if (!ormEntity) return null;
    return ConsultationMapper.toDomain(ormEntity);
  }

  async findByClientId(
    clientId: string,
    status?: ConsultationStatus,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ items: Consultation[]; total: number }> {
    const query = this.repository.createQueryBuilder('consultation');

    query.where('consultation.clientId = :clientId', { clientId });

    if (status) {
      query.andWhere('consultation.status = :status', { status });
    }

    query.orderBy('consultation.createdAt', 'DESC');
    query.limit(limit);
    query.offset(offset);

    const [ormEntities, total] = await query.getManyAndCount();

    return {
      items: ormEntities.map((entity) => ConsultationMapper.toDomain(entity)),
      total,
    };
  }

  async findByLawyerId(
    lawyerId: string,
    status?: ConsultationStatus,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ items: Consultation[]; total: number }> {
    const query = this.repository.createQueryBuilder('consultation');

    query.where('consultation.lawyerId = :lawyerId', { lawyerId });

    if (status) {
      query.andWhere('consultation.status = :status', { status });
    }

    query.orderBy('consultation.createdAt', 'DESC');
    query.limit(limit);
    query.offset(offset);

    const [ormEntities, total] = await query.getManyAndCount();

    return {
      items: ormEntities.map((entity) => ConsultationMapper.toDomain(entity)),
      total,
    };
  }

  async findActiveByClientId(clientId: string): Promise<Consultation | null> {
    const ormEntity = await this.repository.findOne({
      where: [
        { clientId, status: ConsultationStatus.Confirmed },
        { clientId, status: ConsultationStatus.Active },
      ],
      order: { createdAt: 'DESC' },
    });

    if (!ormEntity) return null;
    return ConsultationMapper.toDomain(ormEntity);
  }

  async findActiveByLawyerId(lawyerId: string): Promise<Consultation | null> {
    const ormEntity = await this.repository.findOne({
      where: [
        { lawyerId, status: ConsultationStatus.Confirmed },
        { lawyerId, status: ConsultationStatus.Active },
      ],
      order: { createdAt: 'DESC' },
    });

    if (!ormEntity) return null;
    return ConsultationMapper.toDomain(ormEntity);
  }

  async findExpired(expirationMinutes: number): Promise<Consultation[]> {
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() - expirationMinutes);

    const query = this.repository.createQueryBuilder('consultation');

    query.where('consultation.status = :status', {
      status: ConsultationStatus.Pending,
    });
    query.andWhere('consultation.createdAt < :expirationDate', {
      expirationDate,
    });

    const ormEntities = await query.getMany();

    return ormEntities.map((entity) => ConsultationMapper.toDomain(entity));
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }

  async hasActiveConsultation(lawyerId: string): Promise<boolean> {
    const count = await this.repository.count({
      where: [
        { lawyerId, status: ConsultationStatus.Confirmed },
        { lawyerId, status: ConsultationStatus.Active },
      ],
    });

    return count > 0;
  }

  async hasActiveConsultationForClient(clientId: string): Promise<boolean> {
    const count = await this.repository.count({
      where: [
        { clientId, status: ConsultationStatus.Confirmed },
        { clientId, status: ConsultationStatus.Active },
      ],
    });

    return count > 0;
  }
}
