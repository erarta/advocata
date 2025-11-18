import { AggregateRoot } from '@shared/domain/aggregate-root';
import { Result } from '@shared/domain/result';
import { ConsultationStatus, ConsultationType } from '../enums';
import { ConsultationBookedEvent } from '../events/consultation-booked.event';
import { ConsultationConfirmedEvent } from '../events/consultation-confirmed.event';
import { ConsultationCompletedEvent } from '../events/consultation-completed.event';
import { ConsultationRatedEvent } from '../events/consultation-rated.event';

interface ConsultationProps {
  clientId: string;
  lawyerId: string;
  type: ConsultationType;
  status: ConsultationStatus;
  description: string;
  price: number;
  currency: string;
  scheduledStart?: Date;
  scheduledEnd?: Date;
  confirmedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  rating?: number;
  review?: string;
  cancellationReason?: string;
}

/**
 * Consultation Entity - Aggregate Root
 *
 * Represents a consultation session between a client and a lawyer
 */
export class Consultation extends AggregateRoot<string> {
  private _clientId: string;
  private _lawyerId: string;
  private _type: ConsultationType;
  private _status: ConsultationStatus;
  private _description: string;
  private _price: number;
  private _currency: string;
  private _scheduledStart?: Date;
  private _scheduledEnd?: Date;
  private _confirmedAt?: Date;
  private _startedAt?: Date;
  private _completedAt?: Date;
  private _cancelledAt?: Date;
  private _rating?: number;
  private _review?: string;
  private _cancellationReason?: string;

  private constructor(id: string, props: ConsultationProps) {
    super(id);
    this._clientId = props.clientId;
    this._lawyerId = props.lawyerId;
    this._type = props.type;
    this._status = props.status;
    this._description = props.description;
    this._price = props.price;
    this._currency = props.currency;
    this._scheduledStart = props.scheduledStart;
    this._scheduledEnd = props.scheduledEnd;
    this._confirmedAt = props.confirmedAt;
    this._startedAt = props.startedAt;
    this._completedAt = props.completedAt;
    this._cancelledAt = props.cancelledAt;
    this._rating = props.rating;
    this._review = props.review;
    this._cancellationReason = props.cancellationReason;
  }

  // Getters
  get clientId(): string {
    return this._clientId;
  }

  get lawyerId(): string {
    return this._lawyerId;
  }

  get type(): ConsultationType {
    return this._type;
  }

  get status(): ConsultationStatus {
    return this._status;
  }

  get description(): string {
    return this._description;
  }

  get price(): number {
    return this._price;
  }

  get currency(): string {
    return this._currency;
  }

  get scheduledStart(): Date | undefined {
    return this._scheduledStart;
  }

  get scheduledEnd(): Date | undefined {
    return this._scheduledEnd;
  }

  get confirmedAt(): Date | undefined {
    return this._confirmedAt;
  }

  get startedAt(): Date | undefined {
    return this._startedAt;
  }

  get completedAt(): Date | undefined {
    return this._completedAt;
  }

  get cancelledAt(): Date | undefined {
    return this._cancelledAt;
  }

  get rating(): number | undefined {
    return this._rating;
  }

  get review(): string | undefined {
    return this._review;
  }

  get cancellationReason(): string | undefined {
    return this._cancellationReason;
  }

  get isEmergency(): boolean {
    return this._type === ConsultationType.Emergency;
  }

  get isScheduled(): boolean {
    return this._type === ConsultationType.Scheduled;
  }

  get isPending(): boolean {
    return this._status === ConsultationStatus.Pending;
  }

  get isConfirmed(): boolean {
    return this._status === ConsultationStatus.Confirmed;
  }

  get isActive(): boolean {
    return this._status === ConsultationStatus.Active;
  }

  get isCompleted(): boolean {
    return this._status === ConsultationStatus.Completed;
  }

  get isCancelled(): boolean {
    return this._status === ConsultationStatus.Cancelled;
  }

  get isFailed(): boolean {
    return this._status === ConsultationStatus.Failed;
  }

  get isExpired(): boolean {
    return this._status === ConsultationStatus.Expired;
  }

  get isFinalStatus(): boolean {
    return [
      ConsultationStatus.Completed,
      ConsultationStatus.Cancelled,
      ConsultationStatus.Failed,
      ConsultationStatus.Expired,
    ].includes(this._status);
  }

  get canBeConfirmed(): boolean {
    return this._status === ConsultationStatus.Pending;
  }

  get canBeStarted(): boolean {
    return this._status === ConsultationStatus.Confirmed;
  }

  get canBeCompleted(): boolean {
    return this._status === ConsultationStatus.Active;
  }

  get canBeCancelled(): boolean {
    return !this.isFinalStatus;
  }

  get canBeRated(): boolean {
    return this._status === ConsultationStatus.Completed && !this._rating;
  }

  get actualDuration(): number | undefined {
    if (!this._startedAt || !this._completedAt) {
      return undefined;
    }
    return Math.floor(
      (this._completedAt.getTime() - this._startedAt.getTime()) / 60000,
    ); // minutes
  }

  /**
   * Factory method to create a new Consultation
   */
  public static create(
    id: string,
    clientId: string,
    lawyerId: string,
    type: ConsultationType,
    description: string,
    price: number,
    scheduledStart?: Date,
    scheduledEnd?: Date,
  ): Result<Consultation> {
    // Validate description
    if (!description || description.trim().length === 0) {
      return Result.fail<Consultation>('Description is required');
    }

    if (description.length < 10) {
      return Result.fail<Consultation>(
        'Description is too short (minimum 10 characters)',
      );
    }

    if (description.length > 2000) {
      return Result.fail<Consultation>(
        'Description is too long (maximum 2000 characters)',
      );
    }

    // Validate price
    if (price < 0) {
      return Result.fail<Consultation>('Price cannot be negative');
    }

    // Validate scheduled time for scheduled consultations
    if (type === ConsultationType.Scheduled) {
      if (!scheduledStart) {
        return Result.fail<Consultation>(
          'Scheduled consultation requires start time',
        );
      }

      const now = new Date();
      if (scheduledStart < now) {
        return Result.fail<Consultation>(
          'Scheduled start time cannot be in the past',
        );
      }

      if (scheduledEnd && scheduledEnd <= scheduledStart) {
        return Result.fail<Consultation>(
          'Scheduled end time must be after start time',
        );
      }
    }

    const consultation = new Consultation(id, {
      clientId,
      lawyerId,
      type,
      status: ConsultationStatus.Pending,
      description: description.trim(),
      price,
      currency: 'RUB',
      scheduledStart,
      scheduledEnd,
    });

    // Raise domain event
    consultation.addDomainEvent(
      new ConsultationBookedEvent(
        consultation.id,
        clientId,
        lawyerId,
        type,
        scheduledStart,
      ),
    );

    return Result.ok<Consultation>(consultation);
  }

  /**
   * Reconstitute Consultation from persistence
   */
  public static reconstitute(id: string, props: ConsultationProps): Consultation {
    return new Consultation(id, props);
  }

  /**
   * Confirm consultation (by lawyer)
   */
  public confirm(): Result<void> {
    if (!this.canBeConfirmed) {
      return Result.fail(
        `Cannot confirm consultation in status: ${this._status}`,
      );
    }

    this._status = ConsultationStatus.Confirmed;
    this._confirmedAt = new Date();
    this.touch();

    // Raise domain event
    this.addDomainEvent(
      new ConsultationConfirmedEvent(this.id, this._lawyerId, this._clientId),
    );

    return Result.ok();
  }

  /**
   * Start consultation
   */
  public start(): Result<void> {
    if (!this.canBeStarted) {
      return Result.fail(
        `Cannot start consultation in status: ${this._status}`,
      );
    }

    this._status = ConsultationStatus.Active;
    this._startedAt = new Date();
    this.touch();

    return Result.ok();
  }

  /**
   * Complete consultation
   */
  public complete(): Result<void> {
    if (!this.canBeCompleted) {
      return Result.fail(
        `Cannot complete consultation in status: ${this._status}`,
      );
    }

    this._status = ConsultationStatus.Completed;
    this._completedAt = new Date();
    this.touch();

    // Raise domain event
    this.addDomainEvent(
      new ConsultationCompletedEvent(
        this.id,
        this._clientId,
        this._lawyerId,
        this.actualDuration || 0,
      ),
    );

    return Result.ok();
  }

  /**
   * Cancel consultation
   */
  public cancel(reason: string): Result<void> {
    if (!this.canBeCancelled) {
      return Result.fail(
        `Cannot cancel consultation in status: ${this._status}`,
      );
    }

    if (!reason || reason.trim().length === 0) {
      return Result.fail('Cancellation reason is required');
    }

    if (reason.length > 500) {
      return Result.fail(
        'Cancellation reason is too long (maximum 500 characters)',
      );
    }

    this._status = ConsultationStatus.Cancelled;
    this._cancelledAt = new Date();
    this._cancellationReason = reason.trim();
    this.touch();

    return Result.ok();
  }

  /**
   * Mark as failed
   */
  public fail(reason: string): Result<void> {
    if (this.isFinalStatus) {
      return Result.fail(
        `Cannot mark consultation as failed in status: ${this._status}`,
      );
    }

    if (!reason || reason.trim().length === 0) {
      return Result.fail('Failure reason is required');
    }

    this._status = ConsultationStatus.Failed;
    this._cancellationReason = reason.trim();
    this.touch();

    return Result.ok();
  }

  /**
   * Mark as expired
   */
  public expire(): Result<void> {
    if (this._status !== ConsultationStatus.Pending) {
      return Result.fail(
        'Only pending consultations can be expired',
      );
    }

    this._status = ConsultationStatus.Expired;
    this.touch();

    return Result.ok();
  }

  /**
   * Rate consultation
   */
  public rate(rating: number, review?: string): Result<void> {
    if (!this.canBeRated) {
      if (this._rating) {
        return Result.fail('Consultation has already been rated');
      }
      return Result.fail(
        `Cannot rate consultation in status: ${this._status}`,
      );
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return Result.fail('Rating must be between 1 and 5');
    }

    if (!Number.isInteger(rating)) {
      return Result.fail('Rating must be an integer');
    }

    // Validate review
    if (review !== undefined) {
      if (review.trim().length === 0) {
        review = undefined; // Treat empty string as no review
      } else if (review.length > 1000) {
        return Result.fail('Review is too long (maximum 1000 characters)');
      }
    }

    this._rating = rating;
    this._review = review?.trim();
    this.touch();

    // Raise domain event
    this.addDomainEvent(
      new ConsultationRatedEvent(this.id, this._lawyerId, rating, review),
    );

    return Result.ok();
  }
}
