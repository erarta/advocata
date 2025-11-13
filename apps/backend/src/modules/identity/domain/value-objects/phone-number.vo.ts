import { ValueObject } from '@shared/domain/value-object';
import { Result } from '@shared/domain/result';

interface PhoneNumberProps {
  value: string;
}

/**
 * PhoneNumber Value Object
 *
 * Ensures phone numbers are valid Russian mobile numbers
 * Format: +7XXXXXXXXXX (11 digits with +7 prefix)
 */
export class PhoneNumber extends ValueObject<PhoneNumberProps> {
  private constructor(props: PhoneNumberProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  /**
   * Factory method to create PhoneNumber with validation
   */
  public static create(phoneNumber: string): Result<PhoneNumber> {
    if (!phoneNumber) {
      return Result.fail<PhoneNumber>('Phone number is required');
    }

    // Remove all non-digit characters except +
    let normalized = phoneNumber.replace(/[^\d+]/g, '');

    // Handle different formats
    // +7XXXXXXXXXX, 7XXXXXXXXXX, 8XXXXXXXXXX
    if (normalized.startsWith('8')) {
      normalized = '+7' + normalized.substring(1);
    } else if (normalized.startsWith('7')) {
      normalized = '+' + normalized;
    } else if (!normalized.startsWith('+7')) {
      normalized = '+7' + normalized;
    }

    // Validate format: +7 followed by 10 digits
    const phoneRegex = /^\+7\d{10}$/;
    if (!phoneRegex.test(normalized)) {
      return Result.fail<PhoneNumber>(
        'Invalid phone number format. Expected Russian mobile number (+7XXXXXXXXXX)',
      );
    }

    // Validate mobile operator codes (9XX for mobile)
    const operatorCode = normalized.substring(2, 5);
    const validOperatorCodes = ['900', '901', '902', '903', '904', '905', '906', '908', '909', '910', '911', '912', '913', '914', '915', '916', '917', '918', '919', '920', '921', '922', '923', '924', '925', '926', '927', '928', '929', '930', '931', '932', '933', '934', '936', '937', '938', '939', '941', '950', '951', '952', '953', '954', '955', '956', '958', '960', '961', '962', '963', '964', '965', '966', '967', '968', '969', '977', '978', '980', '981', '982', '983', '984', '985', '986', '987', '988', '989', '991', '992', '993', '994', '995', '996', '997', '999'];

    if (!validOperatorCodes.includes(operatorCode)) {
      return Result.fail<PhoneNumber>(
        'Invalid mobile operator code. Please use a valid Russian mobile number',
      );
    }

    return Result.ok<PhoneNumber>(new PhoneNumber({ value: normalized }));
  }

  public toString(): string {
    return this.value;
  }

  /**
   * Format for display: +7 (XXX) XXX-XX-XX
   */
  public toDisplayFormat(): string {
    const digits = this.value.substring(2); // Remove +7
    return `+7 (${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6, 8)}-${digits.substring(8, 10)}`;
  }
}
