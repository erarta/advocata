import { ValueObject } from '@shared/domain/value-object';
import { Result } from '@shared/domain/result';

interface LicenseNumberProps {
  value: string;
}

/**
 * LicenseNumber Value Object
 *
 * Represents a lawyer's license/bar number issued by authorities
 * Format: Numbers and letters, typically 10-20 characters
 */
export class LicenseNumber extends ValueObject<LicenseNumberProps> {
  private constructor(props: LicenseNumberProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  /**
   * Factory method to create LicenseNumber with validation
   */
  public static create(licenseNumber: string): Result<LicenseNumber> {
    if (!licenseNumber) {
      return Result.fail<LicenseNumber>('License number is required');
    }

    const trimmed = licenseNumber.trim();

    // Remove all non-alphanumeric characters
    const normalized = trimmed.replace(/[^A-Za-zА-Яа-я0-9]/g, '');

    // License number should be between 5 and 30 characters
    if (normalized.length < 5) {
      return Result.fail<LicenseNumber>(
        'License number is too short (minimum 5 characters)',
      );
    }

    if (normalized.length > 30) {
      return Result.fail<LicenseNumber>(
        'License number is too long (maximum 30 characters)',
      );
    }

    // Should contain at least some numbers
    if (!/\d/.test(normalized)) {
      return Result.fail<LicenseNumber>(
        'License number must contain at least one digit',
      );
    }

    return Result.ok<LicenseNumber>(
      new LicenseNumber({ value: normalized.toUpperCase() }),
    );
  }

  public toString(): string {
    return this.value;
  }
}
