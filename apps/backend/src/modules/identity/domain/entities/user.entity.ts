import { AggregateRoot } from '@shared/domain/aggregate-root';
import { Result } from '@shared/domain/result';
import { Email } from '../value-objects/email.vo';
import { PhoneNumber } from '../value-objects/phone-number.vo';
import { UserRole } from '../enums/user-role.enum';
import { UserStatus } from '../enums/user-status.enum';
import { UserRegisteredEvent } from '../events/user-registered.event';
import { UserVerifiedEvent } from '../events/user-verified.event';
import { UserSuspendedEvent } from '../events/user-suspended.event';

interface UserProps {
  phoneNumber: PhoneNumber;
  email?: Email;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
}

/**
 * User Entity - Aggregate Root
 *
 * Represents a user in the Identity & Access context.
 * Handles authentication, verification, and basic profile data.
 */
export class User extends AggregateRoot<string> {
  private _phoneNumber: PhoneNumber;
  private _email?: Email;
  private _firstName: string;
  private _lastName: string;
  private _role: UserRole;
  private _status: UserStatus;
  private _isPhoneVerified: boolean;
  private _isEmailVerified: boolean;
  private _lastLoginAt?: Date;

  private constructor(id: string, props: UserProps) {
    super(id);
    this._phoneNumber = props.phoneNumber;
    this._email = props.email;
    this._firstName = props.firstName;
    this._lastName = props.lastName;
    this._role = props.role;
    this._status = props.status;
    this._isPhoneVerified = props.isPhoneVerified;
    this._isEmailVerified = props.isEmailVerified;
    this._lastLoginAt = props.lastLoginAt;
  }

  // Getters
  get phoneNumber(): PhoneNumber {
    return this._phoneNumber;
  }

  get email(): Email | undefined {
    return this._email;
  }

  get firstName(): string {
    return this._firstName;
  }

  get lastName(): string {
    return this._lastName;
  }

  get fullName(): string {
    return `${this._firstName} ${this._lastName}`;
  }

  get role(): UserRole {
    return this._role;
  }

  get status(): UserStatus {
    return this._status;
  }

  get isPhoneVerified(): boolean {
    return this._isPhoneVerified;
  }

  get isEmailVerified(): boolean {
    return this._isEmailVerified;
  }

  get lastLoginAt(): Date | undefined {
    return this._lastLoginAt;
  }

  get isActive(): boolean {
    return this._status === UserStatus.Active && this._isPhoneVerified;
  }

  /**
   * Factory method to create a new User
   */
  public static create(
    id: string,
    phoneNumber: PhoneNumber,
    firstName: string,
    lastName: string,
    role: UserRole,
  ): Result<User> {
    // Validate firstName
    if (!firstName || firstName.trim().length === 0) {
      return Result.fail<User>('First name is required');
    }
    if (firstName.length > 50) {
      return Result.fail<User>('First name is too long (max 50 characters)');
    }

    // Validate lastName
    if (!lastName || lastName.trim().length === 0) {
      return Result.fail<User>('Last name is required');
    }
    if (lastName.length > 50) {
      return Result.fail<User>('Last name is too long (max 50 characters)');
    }

    const user = new User(id, {
      phoneNumber,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role,
      status: UserStatus.PendingVerification,
      isPhoneVerified: false,
      isEmailVerified: false,
    });

    // Raise domain event
    user.addDomainEvent(
      new UserRegisteredEvent(user.id, phoneNumber.value, role),
    );

    return Result.ok<User>(user);
  }

  /**
   * Reconstitute User from persistence
   */
  public static reconstitute(id: string, props: UserProps): User {
    return new User(id, props);
  }

  /**
   * Verify phone number with OTP
   */
  public verifyPhone(): Result<void> {
    if (this._isPhoneVerified) {
      return Result.fail('Phone number is already verified');
    }

    if (this._status !== UserStatus.PendingVerification) {
      return Result.fail('User is not in pending verification status');
    }

    this._isPhoneVerified = true;
    this._status = UserStatus.Active;
    this.touch();

    // Raise domain event
    this.addDomainEvent(new UserVerifiedEvent(this.id, this._phoneNumber.value));

    return Result.ok();
  }

  /**
   * Add or update email
   */
  public setEmail(email: Email): Result<void> {
    if (this._status !== UserStatus.Active) {
      return Result.fail('User must be active to set email');
    }

    this._email = email;
    this._isEmailVerified = false;
    this.touch();

    return Result.ok();
  }

  /**
   * Verify email
   */
  public verifyEmail(): Result<void> {
    if (!this._email) {
      return Result.fail('Email is not set');
    }

    if (this._isEmailVerified) {
      return Result.fail('Email is already verified');
    }

    this._isEmailVerified = true;
    this.touch();

    return Result.ok();
  }

  /**
   * Update profile information
   */
  public updateProfile(firstName: string, lastName: string): Result<void> {
    if (this._status !== UserStatus.Active) {
      return Result.fail('User must be active to update profile');
    }

    if (!firstName || firstName.trim().length === 0) {
      return Result.fail('First name is required');
    }
    if (firstName.length > 50) {
      return Result.fail('First name is too long');
    }

    if (!lastName || lastName.trim().length === 0) {
      return Result.fail('Last name is required');
    }
    if (lastName.length > 50) {
      return Result.fail('Last name is too long');
    }

    this._firstName = firstName.trim();
    this._lastName = lastName.trim();
    this.touch();

    return Result.ok();
  }

  /**
   * Record login
   */
  public recordLogin(): void {
    this._lastLoginAt = new Date();
    this.touch();
  }

  /**
   * Suspend user account
   */
  public suspend(reason: string): Result<void> {
    if (this._status === UserStatus.Suspended) {
      return Result.fail('User is already suspended');
    }

    if (this._status === UserStatus.Banned || this._status === UserStatus.Deleted) {
      return Result.fail('Cannot suspend banned or deleted user');
    }

    this._status = UserStatus.Suspended;
    this.touch();

    // Raise domain event
    this.addDomainEvent(new UserSuspendedEvent(this.id, reason));

    return Result.ok();
  }

  /**
   * Activate suspended user
   */
  public activate(): Result<void> {
    if (this._status !== UserStatus.Suspended) {
      return Result.fail('Only suspended users can be activated');
    }

    if (!this._isPhoneVerified) {
      return Result.fail('Phone must be verified to activate account');
    }

    this._status = UserStatus.Active;
    this.touch();

    return Result.ok();
  }

  /**
   * Ban user permanently
   */
  public ban(reason: string): Result<void> {
    if (this._status === UserStatus.Banned) {
      return Result.fail('User is already banned');
    }

    if (this._status === UserStatus.Deleted) {
      return Result.fail('Cannot ban deleted user');
    }

    this._status = UserStatus.Banned;
    this.touch();

    return Result.ok();
  }

  /**
   * Delete user account (soft delete)
   */
  public delete(): Result<void> {
    if (this._status === UserStatus.Deleted) {
      return Result.fail('User is already deleted');
    }

    this._status = UserStatus.Deleted;
    this.touch();

    return Result.ok();
  }
}
