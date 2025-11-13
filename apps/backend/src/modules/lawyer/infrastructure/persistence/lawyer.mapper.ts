import { Lawyer } from '../../domain/entities';
import { LicenseNumber, Experience, Rating } from '../../domain/value-objects';
import { SpecializationType } from '../../domain/enums';
import { LawyerOrmEntity } from './lawyer.orm-entity';

/**
 * LawyerMapper
 *
 * Maps between Domain Lawyer entity and ORM Lawyer entity
 */
export class LawyerMapper {
  /**
   * Convert ORM entity to Domain entity
   */
  public static toDomain(ormEntity: LawyerOrmEntity): Lawyer {
    const licenseNumber = LicenseNumber.create(ormEntity.licenseNumber);
    if (licenseNumber.isFailure) {
      throw new Error(`Invalid license number in database: ${ormEntity.licenseNumber}`);
    }

    const experience = Experience.create(ormEntity.experienceYears);
    if (experience.isFailure) {
      throw new Error(`Invalid experience in database: ${ormEntity.experienceYears}`);
    }

    const rating = Rating.create(ormEntity.ratingValue, ormEntity.reviewCount);
    if (rating.isFailure) {
      throw new Error(`Invalid rating in database`);
    }

    const specializations = ormEntity.specializations.map(
      (s) => s as SpecializationType,
    );

    return Lawyer.reconstitute(ormEntity.id, {
      userId: ormEntity.userId,
      licenseNumber: licenseNumber.value,
      specializations,
      experience: experience.value,
      rating: rating.value,
      bio: ormEntity.bio,
      education: ormEntity.education,
      status: ormEntity.status,
      verificationStatus: ormEntity.verificationStatus,
      verificationNotes: ormEntity.verificationNotes || undefined,
      hourlyRate: ormEntity.hourlyRate || undefined,
      isAvailable: ormEntity.isAvailable,
    });
  }

  /**
   * Convert Domain entity to ORM entity
   */
  public static toOrm(domainEntity: Lawyer): LawyerOrmEntity {
    const ormEntity = new LawyerOrmEntity();

    ormEntity.id = domainEntity.id;
    ormEntity.userId = domainEntity.userId;
    ormEntity.licenseNumber = domainEntity.licenseNumber.value;
    ormEntity.specializations = domainEntity.specializations;
    ormEntity.experienceYears = domainEntity.experience.years;
    ormEntity.ratingValue = domainEntity.rating.value;
    ormEntity.reviewCount = domainEntity.rating.reviewCount;
    ormEntity.bio = domainEntity.bio;
    ormEntity.education = domainEntity.education;
    ormEntity.status = domainEntity.status;
    ormEntity.verificationStatus = domainEntity.verificationStatus;
    ormEntity.verificationNotes = domainEntity.verificationNotes || null;
    ormEntity.hourlyRate = domainEntity.hourlyRate || null;
    ormEntity.isAvailable = domainEntity.isAvailable;

    return ormEntity;
  }
}
