import { Consultation } from '../../domain/entities/consultation.entity';
import { ConsultationType, ConsultationStatus } from '../../domain/enums';
import { ConsultationOrmEntity } from './consultation.orm-entity';

/**
 * Consultation Mapper
 *
 * Maps between Consultation domain entity and ORM entity
 */
export class ConsultationMapper {
  /**
   * Map ORM entity to Domain entity
   */
  static toDomain(ormEntity: ConsultationOrmEntity): Consultation {
    return Consultation.reconstitute(ormEntity.id, {
      clientId: ormEntity.clientId,
      lawyerId: ormEntity.lawyerId,
      type: this.mapType(ormEntity.type),
      status: this.mapStatus(ormEntity.status),
      description: ormEntity.description,
      price: Number(ormEntity.price),
      currency: ormEntity.currency,
      scheduledStart: ormEntity.scheduledStart || undefined,
      scheduledEnd: ormEntity.scheduledEnd || undefined,
      confirmedAt: ormEntity.confirmedAt || undefined,
      startedAt: ormEntity.startedAt || undefined,
      completedAt: ormEntity.completedAt || undefined,
      cancelledAt: ormEntity.cancelledAt || undefined,
      rating: ormEntity.rating || undefined,
      review: ormEntity.review || undefined,
      cancellationReason: ormEntity.cancellationReason || undefined,
    });
  }

  /**
   * Map Domain entity to ORM entity
   */
  static toOrm(domain: Consultation): ConsultationOrmEntity {
    const ormEntity = new ConsultationOrmEntity();

    ormEntity.id = domain.id;
    ormEntity.clientId = domain.clientId;
    ormEntity.lawyerId = domain.lawyerId;
    ormEntity.type = domain.type;
    ormEntity.status = domain.status;
    ormEntity.description = domain.description;
    ormEntity.price = domain.price;
    ormEntity.currency = domain.currency;
    ormEntity.scheduledStart = domain.scheduledStart || null;
    ormEntity.scheduledEnd = domain.scheduledEnd || null;
    ormEntity.confirmedAt = domain.confirmedAt || null;
    ormEntity.startedAt = domain.startedAt || null;
    ormEntity.completedAt = domain.completedAt || null;
    ormEntity.cancelledAt = domain.cancelledAt || null;
    ormEntity.rating = domain.rating || null;
    ormEntity.review = domain.review || null;
    ormEntity.cancellationReason = domain.cancellationReason || null;
    ormEntity.createdAt = domain.createdAt;
    ormEntity.updatedAt = domain.updatedAt;

    return ormEntity;
  }

  /**
   * Map string to ConsultationType enum
   */
  private static mapType(type: string): ConsultationType {
    switch (type) {
      case 'emergency':
        return ConsultationType.Emergency;
      case 'scheduled':
        return ConsultationType.Scheduled;
      case 'phone':
        return ConsultationType.Phone;
      case 'video':
        return ConsultationType.Video;
      case 'chat':
        return ConsultationType.Chat;
      case 'in_person':
        return ConsultationType.InPerson;
      default:
        return ConsultationType.Scheduled;
    }
  }

  /**
   * Map string to ConsultationStatus enum
   */
  private static mapStatus(status: string): ConsultationStatus {
    switch (status) {
      case 'pending':
        return ConsultationStatus.Pending;
      case 'confirmed':
        return ConsultationStatus.Confirmed;
      case 'active':
        return ConsultationStatus.Active;
      case 'completed':
        return ConsultationStatus.Completed;
      case 'cancelled':
        return ConsultationStatus.Cancelled;
      case 'failed':
        return ConsultationStatus.Failed;
      case 'expired':
        return ConsultationStatus.Expired;
      default:
        return ConsultationStatus.Pending;
    }
  }
}
