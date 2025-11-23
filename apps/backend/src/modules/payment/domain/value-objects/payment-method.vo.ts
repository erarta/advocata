/**
 * Payment Method Value Object
 *
 * Represents the payment method used for a transaction.
 * Aligns with YooKassa payment methods.
 */
export enum PaymentMethod {
  /**
   * Bank card (Visa, MasterCard, Mir)
   */
  BANK_CARD = 'bank_card',

  /**
   * YooMoney (formerly Yandex.Money)
   */
  YOO_MONEY = 'yoo_money',

  /**
   * SberPay
   */
  SBER_PAY = 'sber_pay',

  /**
   * Mobile payment (phone balance)
   */
  MOBILE_BALANCE = 'mobile_balance',

  /**
   * Cash payment (for offline payments)
   */
  CASH = 'cash',

  /**
   * QIWI Wallet
   */
  QIWI = 'qiwi',

  /**
   * WebMoney
   */
  WEBMONEY = 'webmoney',

  /**
   * Apple Pay
   */
  APPLE_PAY = 'apple_pay',

  /**
   * Google Pay
   */
  GOOGLE_PAY = 'google_pay',

  /**
   * Installments (Тинькoff, Alfabank)
   */
  INSTALLMENTS = 'installments',
}

/**
 * Type guard to check if a string is a valid PaymentMethod
 */
export function isValidPaymentMethod(value: string): value is PaymentMethod {
  return Object.values(PaymentMethod).includes(value as PaymentMethod);
}

/**
 * Get display name for payment method (Russian)
 */
export function getPaymentMethodDisplayName(method: PaymentMethod): string {
  const displayNames: Record<PaymentMethod, string> = {
    [PaymentMethod.BANK_CARD]: 'Банковская карта',
    [PaymentMethod.YOO_MONEY]: 'ЮMoney',
    [PaymentMethod.SBER_PAY]: 'SberPay',
    [PaymentMethod.MOBILE_BALANCE]: 'Баланс телефона',
    [PaymentMethod.CASH]: 'Наличные',
    [PaymentMethod.QIWI]: 'QIWI Кошелек',
    [PaymentMethod.WEBMONEY]: 'WebMoney',
    [PaymentMethod.APPLE_PAY]: 'Apple Pay',
    [PaymentMethod.GOOGLE_PAY]: 'Google Pay',
    [PaymentMethod.INSTALLMENTS]: 'Рассрочка',
  };

  return displayNames[method];
}

/**
 * Get icon name for payment method
 */
export function getPaymentMethodIcon(method: PaymentMethod): string {
  const icons: Record<PaymentMethod, string> = {
    [PaymentMethod.BANK_CARD]: 'credit-card',
    [PaymentMethod.YOO_MONEY]: 'wallet',
    [PaymentMethod.SBER_PAY]: 'sberbank',
    [PaymentMethod.MOBILE_BALANCE]: 'smartphone',
    [PaymentMethod.CASH]: 'banknote',
    [PaymentMethod.QIWI]: 'qiwi',
    [PaymentMethod.WEBMONEY]: 'webmoney',
    [PaymentMethod.APPLE_PAY]: 'apple',
    [PaymentMethod.GOOGLE_PAY]: 'google',
    [PaymentMethod.INSTALLMENTS]: 'calendar',
  };

  return icons[method];
}

/**
 * Check if payment method requires redirect
 */
export function requiresRedirect(method: PaymentMethod): boolean {
  return [
    PaymentMethod.YOO_MONEY,
    PaymentMethod.QIWI,
    PaymentMethod.WEBMONEY,
    PaymentMethod.SBER_PAY,
  ].includes(method);
}
