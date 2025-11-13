import { AggregateRoot } from '@shared/domain/aggregate-root';
import { Result } from '@shared/domain/result';
import { LicenseNumber } from '../value-objects/license-number.vo';
import { Experience } from '../value-objects/experience.vo';
import { Rating } from '../value-objects/rating.vo';
import {
  SpecializationType,
  LawyerStatus,
  VerificationStatus,
} from '../enums';
import { LawyerRegisteredEvent } from '../events/lawyer-registered.event';
import { LawyerVerifiedEvent } from '../events/lawyer-verified.event';
import { LawyerRatedEvent } from '../events/lawyer-rated.event';

interface LawyerProps {
  userId: string; // Reference to User in Identity context
  licenseNumber: LicenseNumber;
  specializations: SpecializationType[];
  experience: Experience;
  rating: Rating;
  bio: string;
  education: string;
  status: LawyerStatus;
  verificationStatus: VerificationStatus;
  verificationNotes?: string;
  hourlyRate?: number; // Ставка за час (₽)
  isAvailable: boolean;
}

/**
 * Lawyer Entity - Aggregate Root
 *
 * Represents a verified legal professional on the platform
 */
export class Lawyer extends AggregateRoot<string> {
  private _userId: string;
  private _licenseNumber: LicenseNumber;
  private _specializations: SpecializationType[];
  private _experience: Experience;
  private _rating: Rating;
  private _bio: string;
  private _education: string;
  private _status: LawyerStatus;
  private _verificationStatus: VerificationStatus;
  private _verificationNotes?: string;
  private _hourlyRate?: number;
  private _isAvailable: boolean;

  private constructor(id: string, props: LawyerProps) {
    super(id);
    this._userId = props.userId;
    this._licenseNumber = props.licenseNumber;
    this._specializations = props.specializations;
    this._experience = props.experience;
    this._rating = props.rating;
    this._bio = props.bio;
    this._education = props.education;
    this._status = props.status;
    this._verificationStatus = props.verificationStatus;
    this._verificationNotes = props.verificationNotes;
    this._hourlyRate = props.hourlyRate;
    this._isAvailable = props.isAvailable;
  }

  // Getters
  get userId(): string {
    return this._userId;
  }

  get licenseNumber(): LicenseNumber {
    return this._licenseNumber;
  }

  get specializations(): SpecializationType[] {
    return [...this._specializations]; // Return copy
  }

  get experience(): Experience {
    return this._experience;
  }

  get rating(): Rating {
    return this._rating;
  }

  get bio(): string {
    return this._bio;
  }

  get education(): string {
    return this._education;
  }

  get status(): LawyerStatus {
    return this._status;
  }

  get verificationStatus(): VerificationStatus {
    return this._verificationStatus;
  }

  get verificationNotes(): string | undefined {
    return this._verificationNotes;
  }

  get hourlyRate(): number | undefined {
    return this._hourlyRate;
  }

  get isAvailable(): boolean {
    return this._isAvailable;
  }

  get isVerified(): boolean {
    return (
      this._verificationStatus === VerificationStatus.Approved &&
      this._status === LawyerStatus.Active
    );
  }

  get canTakeConsultations(): boolean {
    return this.isVerified && this._isAvailable;
  }

  /**
   * Factory method to create a new Lawyer
   */
  public static create(
    id: string,
    userId: string,
    licenseNumber: LicenseNumber,
    specializations: SpecializationType[],
    experience: Experience,
    bio: string,
    education: string,
    hourlyRate?: number,
  ): Result<Lawyer> {
    // Validate specializations
    if (!specializations || specializations.length === 0) {
      return Result.fail<Lawyer>('At least one specialization is required');
    }

    if (specializations.length > 5) {
      return Result.fail<Lawyer>(
        'Maximum 5 specializations allowed',
      );
    }

    // Validate bio
    if (!bio || bio.trim().length === 0) {
      return Result.fail<Lawyer>('Bio is required');
    }

    if (bio.length < 50) {
      return Result.fail<Lawyer>(
        'Bio is too short (minimum 50 characters)',
      );
    }

    if (bio.length > 1000) {
      return Result.fail<Lawyer>(
        'Bio is too long (maximum 1000 characters)',
      );
    }

    // Validate education
    if (!education || education.trim().length === 0) {
      return Result.fail<Lawyer>('Education is required');
    }

    if (education.length > 500) {
      return Result.fail<Lawyer>(
        'Education is too long (maximum 500 characters)',
      );
    }

    // Validate hourly rate
    if (hourlyRate !== undefined) {
      if (hourlyRate < 500) {
        return Result.fail<Lawyer>(
          'Hourly rate is too low (minimum 500₽)',
        );
      }

      if (hourlyRate > 50000) {
        return Result.fail<Lawyer>(
          'Hourly rate is too high (maximum 50,000₽)',
        );
      }
    }

    const lawyer = new Lawyer(id, {
      userId,
      licenseNumber,
      specializations,
      experience,
      rating: Rating.initial(),
      bio: bio.trim(),
      education: education.trim(),
      status: LawyerStatus.PendingVerification,
      verificationStatus: VerificationStatus.NotSubmitted,
      hourlyRate,
      isAvailable: false,
    });

    // Raise domain event
    lawyer.addDomainEvent(
      new LawyerRegisteredEvent(lawyer.id, userId, specializations),
    );

    return Result.ok<Lawyer>(lawyer);
  }

  /**
   * Reconstitute Lawyer from persistence
   */
  public static reconstitute(id: string, props: LawyerProps): Lawyer {
    return new Lawyer(id, props);
  }

  /**
   * Submit for verification
   */
  public submitForVerification(): Result<void> {
    if (this._verificationStatus !== VerificationStatus.NotSubmitted) {
      return Result.fail('Lawyer is already submitted for verification');
    }

    this._verificationStatus = VerificationStatus.Pending;
    this.touch();

    return Result.ok();
  }

  /**
   * Start verification review
   */
  public startReview(): Result<void> {
    if (this._verificationStatus !== VerificationStatus.Pending) {
      return Result.fail('Lawyer must be in pending status to start review');
    }

    this._verificationStatus = VerificationStatus.InReview;
    this.touch();

    return Result.ok();
  }

  /**
   * Approve verification
   */
  public approve(notes?: string): Result<void> {
    if (
      this._verificationStatus !== VerificationStatus.InReview &&
      this._verificationStatus !== VerificationStatus.DocumentsRequested
    ) {
      return Result.fail('Lawyer must be in review to be approved');
    }

    this._verificationStatus = VerificationStatus.Approved;
    this._status = LawyerStatus.Active;
    this._verificationNotes = notes;
    this._isAvailable = true;
    this.touch();

    // Raise domain event
    this.addDomainEvent(new LawyerVerifiedEvent(this.id, this._userId));

    return Result.ok();
  }

  /**
   * Reject verification
   */
  public reject(reason: string): Result<void> {
    if (!reason || reason.trim().length === 0) {
      return Result.fail('Rejection reason is required');
    }

    if (
      this._verificationStatus !== VerificationStatus.InReview &&
      this._verificationStatus !== VerificationStatus.Pending
    ) {
      return Result.fail('Cannot reject lawyer not in review');
    }

    this._verificationStatus = VerificationStatus.Rejected;
    this._verificationNotes = reason.trim();
    this._status = LawyerStatus.Inactive;
    this.touch();

    return Result.ok();
  }

  /**
   * Request additional documents
   */
  public requestDocuments(message: string): Result<void> {
    if (!message || message.trim().length === 0) {
      return Result.fail('Document request message is required');
    }

    if (this._verificationStatus !== VerificationStatus.InReview) {
      return Result.fail('Lawyer must be in review to request documents');
    }

    this._verificationStatus = VerificationStatus.DocumentsRequested;
    this._verificationNotes = message.trim();
    this.touch();

    return Result.ok();
  }

  /**
   * Update profile
   */
  public updateProfile(
    bio: string,
    education: string,
    hourlyRate?: number,
  ): Result<void> {
    if (this._status !== LawyerStatus.Active) {
      return Result.fail('Only active lawyers can update profile');
    }

    // Validate bio
    if (!bio || bio.trim().length === 0) {
      return Result.fail('Bio is required');
    }

    if (bio.length < 50 || bio.length > 1000) {
      return Result.fail('Bio must be between 50 and 1000 characters');
    }

    // Validate education
    if (!education || education.trim().length === 0) {
      return Result.fail('Education is required');
    }

    if (education.length > 500) {
      return Result.fail('Education is too long (max 500 characters)');
    }

    // Validate hourly rate
    if (hourlyRate !== undefined) {
      if (hourlyRate < 500 || hourlyRate > 50000) {
        return Result.fail('Hourly rate must be between 500₽ and 50,000₽');
      }
    }

    this._bio = bio.trim();
    this._education = education.trim();
    this._hourlyRate = hourlyRate;
    this.touch();

    return Result.ok();
  }

  /**
   * Add specialization
   */
  public addSpecialization(
    specialization: SpecializationType,
  ): Result<void> {
    if (this._specializations.includes(specialization)) {
      return Result.fail('Specialization already exists');
    }

    if (this._specializations.length >= 5) {
      return Result.fail('Maximum 5 specializations allowed');
    }

    this._specializations.push(specialization);
    this.touch();

    return Result.ok();
  }

  /**
   * Remove specialization
   */
  public removeSpecialization(
    specialization: SpecializationType,
  ): Result<void> {
    if (this._specializations.length <= 1) {
      return Result.fail('At least one specialization is required');
    }

    const index = this._specializations.indexOf(specialization);
    if (index === -1) {
      return Result.fail('Specialization not found');
    }

    this._specializations.splice(index, 1);
    this.touch();

    return Result.ok();
  }

  /**
   * Add review/rating
   */
  public addRating(ratingValue: number): Result<void> {
    const newRatingResult = this._rating.addReview(ratingValue);

    if (newRatingResult.isFailure) {
      return Result.fail(newRatingResult.error);
    }

    this._rating = newRatingResult.value;
    this.touch();

    // Raise domain event
    this.addDomainEvent(
      new LawyerRatedEvent(this.id, ratingValue, this._rating.value),
    );

    return Result.ok();
  }

  /**
   * Set availability
   */
  public setAvailability(isAvailable: boolean): Result<void> {
    if (this._status !== LawyerStatus.Active) {
      return Result.fail('Only active lawyers can change availability');
    }

    this._isAvailable = isAvailable;
    this.touch();

    return Result.ok();
  }

  /**
   * Suspend lawyer
   */
  public suspend(reason: string): Result<void> {
    if (!reason || reason.trim().length === 0) {
      return Result.fail('Suspension reason is required');
    }

    if (this._status === LawyerStatus.Suspended) {
      return Result.fail('Lawyer is already suspended');
    }

    this._status = LawyerStatus.Suspended;
    this._verificationNotes = reason.trim();
    this._isAvailable = false;
    this.touch();

    return Result.ok();
  }

  /**
   * Activate suspended lawyer
   */
  public activate(): Result<void> {
    if (this._status !== LawyerStatus.Suspended) {
      return Result.fail('Only suspended lawyers can be activated');
    }

    if (this._verificationStatus !== VerificationStatus.Approved) {
      return Result.fail('Lawyer must be verified to be activated');
    }

    this._status = LawyerStatus.Active;
    this._isAvailable = true;
    this.touch();

    return Result.ok();
  }
}
