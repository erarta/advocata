import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IEmergencyCallRepository } from '../../domain/repositories/emergency-call.repository.interface';
import { EmergencyCall } from '../../domain/entities/emergency-call.entity';
import { Location } from '../../domain/value-objects/location.vo';
import { EmergencyCallOrmEntity } from './emergency-call.orm-entity';
import { EmergencyCallMapper } from './emergency-call.mapper';

/**
 * Emergency Call Repository Implementation
 * Handles data persistence with TypeORM and PostGIS
 */
@Injectable()
export class EmergencyCallRepository implements IEmergencyCallRepository {
  constructor(
    @InjectRepository(EmergencyCallOrmEntity)
    private readonly repository: Repository<EmergencyCallOrmEntity>,
  ) {}

  async create(emergencyCall: EmergencyCall): Promise<EmergencyCall> {
    const ormEntity = EmergencyCallMapper.toOrm(emergencyCall);
    const saved = await this.repository.save(ormEntity);
    return EmergencyCallMapper.toDomain(saved);
  }

  async findById(id: string): Promise<EmergencyCall | null> {
    const ormEntity = await this.repository.findOne({ where: { id } });
    return ormEntity ? EmergencyCallMapper.toDomain(ormEntity) : null;
  }

  async findByUserId(userId: string): Promise<EmergencyCall[]> {
    const ormEntities = await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return EmergencyCallMapper.toDomainMany(ormEntities);
  }

  async findByLawyerId(lawyerId: string): Promise<EmergencyCall[]> {
    const ormEntities = await this.repository.find({
      where: { lawyerId },
      order: { createdAt: 'DESC' },
    });
    return EmergencyCallMapper.toDomainMany(ormEntities);
  }

  async findNearbyLawyers(
    location: Location,
    radiusInMeters: number,
  ): Promise<
    Array<{
      lawyerId: string;
      distance: number;
      lastKnownLocation: Location;
    }>
  > {
    // Query using PostGIS ST_DWithin for nearby lawyers
    const query = `
      SELECT
        l.id as lawyer_id,
        ST_Distance(
          l.last_known_location,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
        ) as distance,
        ST_Y(l.last_known_location::geometry) as latitude,
        ST_X(l.last_known_location::geometry) as longitude
      FROM lawyers l
      WHERE
        l.is_available = true
        AND l.status = 'active'
        AND l.last_known_location IS NOT NULL
        AND ST_DWithin(
          l.last_known_location,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          $3
        )
      ORDER BY distance
      LIMIT 20;
    `;

    const result = await this.repository.query(query, [
      location.longitude,
      location.latitude,
      radiusInMeters,
    ]);

    return result.map((row: any) => ({
      lawyerId: row.lawyer_id,
      distance: parseFloat(row.distance),
      lastKnownLocation: Location.create(
        parseFloat(row.latitude),
        parseFloat(row.longitude),
      ),
    }));
  }

  async update(emergencyCall: EmergencyCall): Promise<EmergencyCall> {
    const ormEntity = EmergencyCallMapper.toOrm(emergencyCall);
    await this.repository.save(ormEntity);
    return emergencyCall;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findActiveCalls(): Promise<EmergencyCall[]> {
    const ormEntities = await this.repository
      .createQueryBuilder('call')
      .where('call.status IN (:...statuses)', {
        statuses: ['pending', 'accepted'],
      })
      .orderBy('call.created_at', 'DESC')
      .getMany();

    return EmergencyCallMapper.toDomainMany(ormEntities);
  }

  async findPendingCallsNearLocation(
    location: Location,
    radiusInMeters: number,
  ): Promise<EmergencyCall[]> {
    const query = `
      SELECT *
      FROM emergency_calls
      WHERE
        status = 'pending'
        AND ST_DWithin(
          location,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          $3
        )
      ORDER BY created_at DESC;
    `;

    const ormEntities = await this.repository.query(query, [
      location.longitude,
      location.latitude,
      radiusInMeters,
    ]);

    return EmergencyCallMapper.toDomainMany(ormEntities);
  }
}
