import { Location } from '../value-objects/location.vo';
import { CallStatus, CallStatusType } from '../value-objects/call-status.vo';

/**
 * Emergency Call Domain Entity
 * Represents an emergency legal assistance request
 * Follows DDD principles with rich domain logic
 */
export class EmergencyCall {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public lawyerId: string | null,
    public readonly location: Location,
    public readonly address: string,
    public status: CallStatus,
    public readonly notes: string | null,
    public readonly createdAt: Date,
    public acceptedAt: Date | null,
    public completedAt: Date | null,
  ) {}

  /**
   * Creates a new emergency call
   */
  static create(
    id: string,
    userId: string,
    location: Location,
    address: string,
    notes: string | null = null,
  ): EmergencyCall {
    return new EmergencyCall(
      id,
      userId,
      null,
      location,
      address,
      CallStatus.pending(),
      notes,
      new Date(),
      null,
      null,
    );
  }

  /**
   * Accepts the emergency call by a lawyer
   */
  accept(lawyerId: string): void {
    if (!this.status.isPending()) {
      throw new Error(
        `Cannot accept call with status: ${this.status.toString()}`,
      );
    }

    if (!lawyerId) {
      throw new Error('Lawyer ID is required to accept call');
    }

    this.lawyerId = lawyerId;
    this.status = CallStatus.accepted();
    this.acceptedAt = new Date();
  }

  /**
   * Completes the emergency call
   */
  complete(): void {
    if (!this.status.isAccepted()) {
      throw new Error(
        `Cannot complete call with status: ${this.status.toString()}`,
      );
    }

    this.status = CallStatus.completed();
    this.completedAt = new Date();
  }

  /**
   * Cancels the emergency call
   */
  cancel(): void {
    if (this.status.isCompleted()) {
      throw new Error('Cannot cancel a completed call');
    }

    if (this.status.isCancelled()) {
      throw new Error('Call is already cancelled');
    }

    this.status = CallStatus.cancelled();
  }

  /**
   * Checks if call can be accepted
   */
  canBeAccepted(): boolean {
    return this.status.isPending();
  }

  /**
   * Checks if call can be completed
   */
  canBeCompleted(): boolean {
    return this.status.isAccepted();
  }

  /**
   * Gets call duration in minutes
   */
  getDurationInMinutes(): number | null {
    if (!this.acceptedAt || !this.completedAt) {
      return null;
    }

    const duration = this.completedAt.getTime() - this.acceptedAt.getTime();
    return Math.floor(duration / (1000 * 60));
  }

  /**
   * Checks if call is active
   */
  isActive(): boolean {
    return this.status.isAccepted() || this.status.isPending();
  }

  /**
   * Converts to plain object
   */
  toObject(): {
    id: string;
    userId: string;
    lawyerId: string | null;
    latitude: number;
    longitude: number;
    address: string;
    status: string;
    notes: string | null;
    createdAt: Date;
    acceptedAt: Date | null;
    completedAt: Date | null;
  } {
    return {
      id: this.id,
      userId: this.userId,
      lawyerId: this.lawyerId,
      latitude: this.location.latitude,
      longitude: this.location.longitude,
      address: this.address,
      status: this.status.toString(),
      notes: this.notes,
      createdAt: this.createdAt,
      acceptedAt: this.acceptedAt,
      completedAt: this.completedAt,
    };
  }
}
