import { ValueObject } from '@shared/domain/value-object';
import { Result } from '@shared/domain/result';

interface EmailProps {
  value: string;
}

/**
 * Email Value Object
 *
 * Ensures email addresses are valid and normalized
 */
export class Email extends ValueObject<EmailProps> {
  private constructor(props: EmailProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  /**
   * Factory method to create Email with validation
   */
  public static create(email: string): Result<Email> {
    if (!email) {
      return Result.fail<Email>('Email is required');
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return Result.fail<Email>('Invalid email format');
    }

    // Check email length
    if (normalizedEmail.length > 255) {
      return Result.fail<Email>('Email is too long (max 255 characters)');
    }

    return Result.ok<Email>(new Email({ value: normalizedEmail }));
  }

  public toString(): string {
    return this.value;
  }
}
