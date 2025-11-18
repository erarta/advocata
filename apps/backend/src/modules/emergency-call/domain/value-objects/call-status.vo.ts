/**
 * Emergency Call Status Value Object
 * Represents the lifecycle status of an emergency call
 */
export enum CallStatusType {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export class CallStatus {
  private constructor(public readonly value: CallStatusType) {}

  /**
   * Creates a pending status
   */
  static pending(): CallStatus {
    return new CallStatus(CallStatusType.PENDING);
  }

  /**
   * Creates an accepted status
   */
  static accepted(): CallStatus {
    return new CallStatus(CallStatusType.ACCEPTED);
  }

  /**
   * Creates a completed status
   */
  static completed(): CallStatus {
    return new CallStatus(CallStatusType.COMPLETED);
  }

  /**
   * Creates a cancelled status
   */
  static cancelled(): CallStatus {
    return new CallStatus(CallStatusType.CANCELLED);
  }

  /**
   * Creates from string value
   */
  static fromString(value: string): CallStatus {
    const statusType = Object.values(CallStatusType).find((s) => s === value);
    if (!statusType) {
      throw new Error(`Invalid call status: ${value}`);
    }
    return new CallStatus(statusType);
  }

  /**
   * Checks if status is pending
   */
  isPending(): boolean {
    return this.value === CallStatusType.PENDING;
  }

  /**
   * Checks if status is accepted
   */
  isAccepted(): boolean {
    return this.value === CallStatusType.ACCEPTED;
  }

  /**
   * Checks if status is completed
   */
  isCompleted(): boolean {
    return this.value === CallStatusType.COMPLETED;
  }

  /**
   * Checks if status is cancelled
   */
  isCancelled(): boolean {
    return this.value === CallStatusType.CANCELLED;
  }

  /**
   * Checks equality
   */
  equals(other: CallStatus): boolean {
    return this.value === other.value;
  }

  /**
   * Converts to string
   */
  toString(): string {
    return this.value;
  }
}
