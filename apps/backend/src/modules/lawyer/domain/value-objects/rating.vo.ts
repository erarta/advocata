import { ValueObject } from '@shared/domain/value-object';
import { Result } from '@shared/domain/result';

interface RatingProps {
  value: number;
  reviewCount: number;
}

/**
 * Rating Value Object
 *
 * Represents lawyer's rating (1-5 stars) and number of reviews
 */
export class Rating extends ValueObject<RatingProps> {
  private constructor(props: RatingProps) {
    super(props);
  }

  get value(): number {
    return this.props.value;
  }

  get reviewCount(): number {
    return this.props.reviewCount;
  }

  /**
   * Factory method to create Rating with validation
   */
  public static create(value: number, reviewCount: number): Result<Rating> {
    if (value === null || value === undefined) {
      return Result.fail<Rating>('Rating value is required');
    }

    if (value < 1 || value > 5) {
      return Result.fail<Rating>('Rating must be between 1 and 5');
    }

    if (reviewCount < 0) {
      return Result.fail<Rating>('Review count cannot be negative');
    }

    // Round to 1 decimal place
    const roundedValue = Math.round(value * 10) / 10;

    return Result.ok<Rating>(
      new Rating({ value: roundedValue, reviewCount }),
    );
  }

  /**
   * Create initial rating for new lawyer
   */
  public static initial(): Rating {
    return new Rating({ value: 0, reviewCount: 0 });
  }

  /**
   * Calculate new rating after receiving a review
   */
  public addReview(newRating: number): Result<Rating> {
    if (newRating < 1 || newRating > 5) {
      return Result.fail<Rating>('Review rating must be between 1 and 5');
    }

    const totalRating = this.value * this.reviewCount + newRating;
    const newReviewCount = this.reviewCount + 1;
    const newValue = totalRating / newReviewCount;

    return Rating.create(newValue, newReviewCount);
  }

  /**
   * Check if rating is good (4.0+)
   */
  public isGood(): boolean {
    return this.value >= 4.0 && this.reviewCount >= 5;
  }

  /**
   * Check if rating is excellent (4.5+)
   */
  public isExcellent(): boolean {
    return this.value >= 4.5 && this.reviewCount >= 10;
  }

  /**
   * Check if lawyer has enough reviews to be trusted
   */
  public isTrusted(): boolean {
    return this.reviewCount >= 10;
  }

  public toString(): string {
    if (this.reviewCount === 0) {
      return 'Нет отзывов';
    }
    return `${this.value.toFixed(1)} (${this.reviewCount} ${this.getReviewWord()})`;
  }

  private getReviewWord(): string {
    const count = this.reviewCount % 100;
    if (count >= 11 && count <= 14) return 'отзывов';

    const lastDigit = count % 10;
    if (lastDigit === 1) return 'отзыв';
    if (lastDigit >= 2 && lastDigit <= 4) return 'отзыва';
    return 'отзывов';
  }
}
