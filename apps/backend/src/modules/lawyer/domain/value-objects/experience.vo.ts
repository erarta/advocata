import { ValueObject } from '@shared/domain/value-object';
import { Result } from '@shared/domain/result';

interface ExperienceProps {
  years: number;
}

/**
 * Experience Value Object
 *
 * Represents lawyer's years of experience
 */
export class Experience extends ValueObject<ExperienceProps> {
  private constructor(props: ExperienceProps) {
    super(props);
  }

  get years(): number {
    return this.props.years;
  }

  /**
   * Factory method to create Experience with validation
   */
  public static create(years: number): Result<Experience> {
    if (years === null || years === undefined) {
      return Result.fail<Experience>('Experience years is required');
    }

    if (!Number.isInteger(years)) {
      return Result.fail<Experience>('Experience years must be a whole number');
    }

    if (years < 0) {
      return Result.fail<Experience>('Experience years cannot be negative');
    }

    if (years > 70) {
      return Result.fail<Experience>(
        'Experience years seems unrealistic (maximum 70 years)',
      );
    }

    return Result.ok<Experience>(new Experience({ years }));
  }

  /**
   * Check if lawyer is experienced (5+ years)
   */
  public isExperienced(): boolean {
    return this.years >= 5;
  }

  /**
   * Check if lawyer is senior (10+ years)
   */
  public isSenior(): boolean {
    return this.years >= 10;
  }

  /**
   * Get experience level description
   */
  public getLevel(): string {
    if (this.years === 0) return 'Начинающий';
    if (this.years < 3) return 'Младший';
    if (this.years < 5) return 'Специалист';
    if (this.years < 10) return 'Опытный';
    return 'Старший';
  }

  public toString(): string {
    if (this.years === 0) return 'Без опыта';
    if (this.years === 1) return '1 год';
    if (this.years < 5) return `${this.years} года`;
    return `${this.years} лет`;
  }
}
