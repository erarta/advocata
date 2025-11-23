import { ValueObject } from '@/shared/domain/value-object';
import { Result } from '@/shared/domain/result';

/**
 * NotificationStatus Value Object
 *
 * Represents the delivery status of a notification
 */
export class NotificationStatus extends ValueObject<string> {
  public static readonly PENDING = new NotificationStatus('pending');
  public static readonly SENT = new NotificationStatus('sent');
  public static readonly DELIVERED = new NotificationStatus('delivered');
  public static readonly FAILED = new NotificationStatus('failed');
  public static readonly BOUNCED = new NotificationStatus('bounced');

  private constructor(value: string) {
    super(value);
  }

  public static create(value: string): Result<NotificationStatus> {
    if (!value || value.trim().length === 0) {
      return Result.fail<NotificationStatus>('Notification status cannot be empty');
    }

    const normalizedValue = value.toLowerCase().trim();

    if (!['pending', 'sent', 'delivered', 'failed', 'bounced'].includes(normalizedValue)) {
      return Result.fail<NotificationStatus>(
        'Notification status must be one of: pending, sent, delivered, failed, bounced',
      );
    }

    return Result.ok<NotificationStatus>(new NotificationStatus(normalizedValue));
  }

  get isPending(): boolean {
    return this.value === 'pending';
  }

  get isSent(): boolean {
    return this.value === 'sent';
  }

  get isDelivered(): boolean {
    return this.value === 'delivered';
  }

  get isFailed(): boolean {
    return this.value === 'failed';
  }

  get isBounced(): boolean {
    return this.value === 'bounced';
  }
}
