/**
 * Get Payment Query
 *
 * Query to retrieve a payment by ID.
 */
export class GetPaymentQuery {
  constructor(
    public readonly paymentId: string,
    public readonly userId?: string, // For authorization check
  ) {}
}
