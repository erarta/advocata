import { User } from '../../domain/entities';
import { Email, PhoneNumber } from '../../domain/value-objects';
import { UserOrmEntity } from './user.orm-entity';

/**
 * UserMapper
 *
 * Maps between Domain User entity and ORM User entity
 */
export class UserMapper {
  /**
   * Convert ORM entity to Domain entity
   */
  public static toDomain(ormEntity: UserOrmEntity): User {
    const phoneNumber = PhoneNumber.create(ormEntity.phoneNumber);
    if (phoneNumber.isFailure) {
      throw new Error(`Invalid phone number in database: ${ormEntity.phoneNumber}`);
    }

    let email: Email | undefined;
    if (ormEntity.email) {
      const emailOrError = Email.create(ormEntity.email);
      if (emailOrError.isFailure) {
        throw new Error(`Invalid email in database: ${ormEntity.email}`);
      }
      email = emailOrError.value;
    }

    return User.reconstitute(ormEntity.id, {
      phoneNumber: phoneNumber.value,
      email,
      firstName: ormEntity.firstName,
      lastName: ormEntity.lastName,
      role: ormEntity.role,
      status: ormEntity.status,
      isPhoneVerified: ormEntity.isPhoneVerified,
      isEmailVerified: ormEntity.isEmailVerified,
      lastLoginAt: ormEntity.lastLoginAt || undefined,
    });
  }

  /**
   * Convert Domain entity to ORM entity
   */
  public static toOrm(domainEntity: User): UserOrmEntity {
    const ormEntity = new UserOrmEntity();

    ormEntity.id = domainEntity.id;
    ormEntity.phoneNumber = domainEntity.phoneNumber.value;
    ormEntity.email = domainEntity.email?.value || null;
    ormEntity.firstName = domainEntity.firstName;
    ormEntity.lastName = domainEntity.lastName;
    ormEntity.role = domainEntity.role;
    ormEntity.status = domainEntity.status;
    ormEntity.isPhoneVerified = domainEntity.isPhoneVerified;
    ormEntity.isEmailVerified = domainEntity.isEmailVerified;
    ormEntity.lastLoginAt = domainEntity.lastLoginAt || null;

    return ormEntity;
  }
}
