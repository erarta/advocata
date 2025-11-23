import { ValueObject } from '@/shared/domain/value-object';
import { Result } from '@/shared/domain/result';

/**
 * Money Value Object Properties
 */
export interface MoneyProps {
  amount: number;
  currency: string;
}

/**
 * Money Value Object
 *
 * Represents a monetary amount with currency.
 * Immutable value object for financial calculations.
 */
export class Money extends ValueObject<MoneyProps> {
  // Supported currencies
  private static readonly SUPPORTED_CURRENCIES = ['RUB', 'USD', 'EUR'];

  // Default currency for the platform
  private static readonly DEFAULT_CURRENCY = 'RUB';

  // Minimum payment amount (in RUB)
  private static readonly MIN_AMOUNT_RUB = 1;

  // Maximum payment amount (in RUB) - 15 million rubles
  private static readonly MAX_AMOUNT_RUB = 15_000_000;

  get amount(): number {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency;
  }

  /**
   * Get amount in kopecks (for YooKassa API)
   * YooKassa requires amounts in the smallest currency unit
   */
  get amountInKopecks(): number {
    return Math.round(this.props.amount * 100);
  }

  /**
   * Get formatted amount with currency symbol
   */
  get formatted(): string {
    const symbols: Record<string, string> = {
      RUB: '₽',
      USD: '$',
      EUR: '€',
    };

    const symbol = symbols[this.props.currency] || this.props.currency;

    return `${this.props.amount.toLocaleString('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${symbol}`;
  }

  /**
   * Create Money from rubles
   */
  public static fromRubles(amount: number): Result<Money> {
    return this.create({ amount, currency: this.DEFAULT_CURRENCY });
  }

  /**
   * Create Money from kopecks (from YooKassa API)
   */
  public static fromKopecks(kopecks: number, currency: string = 'RUB'): Result<Money> {
    const amount = kopecks / 100;
    return this.create({ amount, currency });
  }

  /**
   * Create Money with validation
   */
  public static create(props: MoneyProps): Result<Money> {
    // Validate currency
    if (!this.SUPPORTED_CURRENCIES.includes(props.currency.toUpperCase())) {
      return Result.fail<Money>(
        `Currency "${props.currency}" is not supported. Supported: ${this.SUPPORTED_CURRENCIES.join(', ')}`,
      );
    }

    // Normalize currency to uppercase
    const currency = props.currency.toUpperCase();

    // Validate amount
    if (props.amount < 0) {
      return Result.fail<Money>('Amount cannot be negative');
    }

    if (!Number.isFinite(props.amount)) {
      return Result.fail<Money>('Amount must be a finite number');
    }

    // Validate amount range (for RUB)
    if (currency === 'RUB') {
      if (props.amount < this.MIN_AMOUNT_RUB) {
        return Result.fail<Money>(
          `Amount must be at least ${this.MIN_AMOUNT_RUB} ${currency}`,
        );
      }

      if (props.amount > this.MAX_AMOUNT_RUB) {
        return Result.fail<Money>(
          `Amount cannot exceed ${this.MAX_AMOUNT_RUB.toLocaleString()} ${currency}`,
        );
      }
    }

    // Validate precision (max 2 decimal places)
    const decimalPlaces = (props.amount.toString().split('.')[1] || '').length;
    if (decimalPlaces > 2) {
      return Result.fail<Money>('Amount can have at most 2 decimal places');
    }

    return Result.ok<Money>(
      new Money({
        amount: props.amount,
        currency,
      }),
    );
  }

  /**
   * Add another Money value
   */
  public add(other: Money): Result<Money> {
    if (this.currency !== other.currency) {
      return Result.fail<Money>(
        `Cannot add different currencies: ${this.currency} and ${other.currency}`,
      );
    }

    return Money.create({
      amount: this.amount + other.amount,
      currency: this.currency,
    });
  }

  /**
   * Subtract another Money value
   */
  public subtract(other: Money): Result<Money> {
    if (this.currency !== other.currency) {
      return Result.fail<Money>(
        `Cannot subtract different currencies: ${this.currency} and ${other.currency}`,
      );
    }

    return Money.create({
      amount: this.amount - other.amount,
      currency: this.currency,
    });
  }

  /**
   * Multiply by a number
   */
  public multiply(multiplier: number): Result<Money> {
    if (!Number.isFinite(multiplier)) {
      return Result.fail<Money>('Multiplier must be a finite number');
    }

    return Money.create({
      amount: this.amount * multiplier,
      currency: this.currency,
    });
  }

  /**
   * Apply percentage (e.g., 10% = 0.10)
   */
  public applyPercentage(percentage: number): Result<Money> {
    if (percentage < 0 || percentage > 1) {
      return Result.fail<Money>('Percentage must be between 0 and 1');
    }

    return Money.create({
      amount: this.amount * percentage,
      currency: this.currency,
    });
  }

  /**
   * Check if this Money is greater than another
   */
  public isGreaterThan(other: Money): boolean {
    if (this.currency !== other.currency) {
      throw new Error('Cannot compare different currencies');
    }

    return this.amount > other.amount;
  }

  /**
   * Check if this Money is less than another
   */
  public isLessThan(other: Money): boolean {
    if (this.currency !== other.currency) {
      throw new Error('Cannot compare different currencies');
    }

    return this.amount < other.amount;
  }

  /**
   * Check if this Money equals another
   */
  public isEqualTo(other: Money): boolean {
    return this.currency === other.currency && this.amount === other.amount;
  }

  /**
   * Get zero Money in the same currency
   */
  public zero(): Money {
    return new Money({ amount: 0, currency: this.currency });
  }

  /**
   * Get supported currencies
   */
  public static getSupportedCurrencies(): string[] {
    return [...this.SUPPORTED_CURRENCIES];
  }

  /**
   * Get default currency
   */
  public static getDefaultCurrency(): string {
    return this.DEFAULT_CURRENCY;
  }
}
