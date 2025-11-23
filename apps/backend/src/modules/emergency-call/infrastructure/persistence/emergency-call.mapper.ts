import { EmergencyCall } from '../../domain/entities/emergency-call.entity';
import { Location } from '../../domain/value-objects/location.vo';
import { CallStatus } from '../../domain/value-objects/call-status.vo';
import { EmergencyCallOrmEntity } from './emergency-call.orm-entity';

/**
 * Emergency Call Mapper
 * Maps between domain entity and ORM entity
 */
export class EmergencyCallMapper {
  /**
   * Converts ORM entity to domain entity
   */
  static toDomain(ormEntity: EmergencyCallOrmEntity): EmergencyCall {
    const location = Location.create(
      ormEntity.latitude,
      ormEntity.longitude,
    );
    const status = CallStatus.fromString(ormEntity.status);

    return new EmergencyCall(
      ormEntity.id,
      ormEntity.userId,
      ormEntity.lawyerId,
      location,
      ormEntity.address,
      status,
      ormEntity.notes,
      ormEntity.createdAt,
      ormEntity.acceptedAt,
      ormEntity.completedAt,
    );
  }

  /**
   * Converts domain entity to ORM entity
   */
  static toOrm(domainEntity: EmergencyCall): EmergencyCallOrmEntity {
    const ormEntity = new EmergencyCallOrmEntity();

    ormEntity.id = domainEntity.id;
    ormEntity.userId = domainEntity.userId;
    ormEntity.lawyerId = domainEntity.lawyerId;
    ormEntity.latitude = domainEntity.location.latitude;
    ormEntity.longitude = domainEntity.location.longitude;
    ormEntity.address = domainEntity.address;
    ormEntity.status = domainEntity.status.toString();
    ormEntity.notes = domainEntity.notes;
    ormEntity.createdAt = domainEntity.createdAt;
    ormEntity.acceptedAt = domainEntity.acceptedAt;
    ormEntity.completedAt = domainEntity.completedAt;

    return ormEntity;
  }

  /**
   * Converts array of ORM entities to domain entities
   */
  static toDomainMany(ormEntities: EmergencyCallOrmEntity[]): EmergencyCall[] {
    return ormEntities.map((ormEntity) => this.toDomain(ormEntity));
  }
}
