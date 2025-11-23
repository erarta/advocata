import { PaymentStatus } from '../../../domain/value-objects/payment-status.vo';

/**
 * Get User Payments Query
 *
 * Query to retrieve payment history for a user.
 */
export class GetUserPaymentsQuery {
  constructor(
    public readonly userId: string,
    public readonly status?: PaymentStatus,
    public readonly limit: number = 50,
    public readonly offset: number = 0,
  ) {}
}
