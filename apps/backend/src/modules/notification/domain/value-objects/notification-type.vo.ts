import { ValueObject } from '@/shared/domain/value-object';
import { Result } from '@/shared/domain/result';

/**
 * NotificationType Value Object
 *
 * Represents the type of notification (email, sms, push)
 */
export class NotificationType extends ValueObject<string> {
  public static readonly EMAIL = new NotificationType('email');
  public static readonly SMS = new NotificationType('sms');
  public static readonly PUSH = new NotificationType('push');

  private constructor(value: string) {
    super(value);
  }

  public static create(value: string): Result<NotificationType> {
    if (!value || value.trim().length === 0) {
      return Result.fail<NotificationType>('Notification type cannot be empty');
    }

    const normalizedValue = value.toLowerCase().trim();

    if (!['email', 'sms', 'push'].includes(normalizedValue)) {
      return Result.fail<NotificationType>(
        'Notification type must be one of: email, sms, push',
      );
    }

    return Result.ok<NotificationType>(new NotificationType(normalizedValue));
  }

  get isEmail(): boolean {
    return this.value === 'email';
  }

  get isSms(): boolean {
    return this.value === 'sms';
  }

  get isPush(): boolean {
    return this.value === 'push';
  }
}
